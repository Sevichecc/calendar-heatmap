import Papa from 'papaparse';

interface TimeEntry {
  date: Date;
  duration: number;
  title: string;
  note?: string;
  category?: string;
  tags?: string[];
}

interface DurationRow {
  'Start date'?: string;
  'End date'?: string;
  Duration?: string | number;
  Title?: string;
  [key: string]: string | number | undefined;
}

interface CsvRow extends DurationRow {
  'Start date': string;
  'End date'?: string;
  Title?: string;
  Notes?: string;
  Duration?: string | number;
}

function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Comprehensive date parser that handles various date formats
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Remove any leading/trailing whitespace
  dateStr = dateStr.trim();
  
  // Try direct Date parsing first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Common date format patterns
  const patterns = [
    // MM/DD/YY
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})(?:\s|$)/,
      handler: (match: RegExpMatchArray) => {
        const [, month, day, year] = match;
        const fullYear = parseInt(year) + (parseInt(year) < 50 ? 2000 : 1900);
        return new Date(fullYear, parseInt(month) - 1, parseInt(day));
      }
    },
    // YYYY/MM/DD
    {
      regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s|$)/,
      handler: (match: RegExpMatchArray) => {
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    },
    // DD-MM-YYYY
    {
      regex: /^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s|$)/,
      handler: (match: RegExpMatchArray) => {
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    },
    // YYYY-MM-DD
    {
      regex: /^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s|$)/,
      handler: (match: RegExpMatchArray) => {
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    },
    // DD.MM.YYYY
    {
      regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s|$)/,
      handler: (match: RegExpMatchArray) => {
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    },
    // Mon DD, YYYY
    {
      regex: /^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})(?:\s|$)/,
      handler: (match: RegExpMatchArray) => {
        const [, month, day, year] = match;
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        return new Date(parseInt(year), monthIndex, parseInt(day));
      }
    }
  ];

  // Try each pattern
  for (const { regex, handler } of patterns) {
    const match = dateStr.match(regex);
    if (match) {
      try {
        date = handler(match);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        console.warn(`Error parsing date with pattern ${regex}:`, e);
      }
    }
  }

  // Handle special date strings with time
  const timePatterns = [
    // MM/DD/YY HH:MM AM/PM
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i,
      handler: (match: RegExpMatchArray) => {
        const [, month, day, year, hours, minutes, ampm] = match;
        const fullYear = parseInt(year) + (parseInt(year) < 50 ? 2000 : 1900);
        let hour = parseInt(hours);
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
          if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
        }
        return new Date(fullYear, parseInt(month) - 1, parseInt(day), hour, parseInt(minutes));
      }
    },
    // YYYY/MM/DD HH:MM
    {
      regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/,
      handler: (match: RegExpMatchArray) => {
        const [, year, month, day, hours, minutes] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                       parseInt(hours), parseInt(minutes));
      }
    }
  ];

  // Try time patterns
  for (const { regex, handler } of timePatterns) {
    const match = dateStr.match(regex);
    if (match) {
      try {
        date = handler(match);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        console.warn(`Error parsing date with time pattern ${regex}:`, e);
      }
    }
  }

  // If all fails, return null
  return null;
}

/**
 * Parse duration string into hours
 */
function parseDuration(durationStr: string | number | undefined, row?: DurationRow): number {
  if (!durationStr && !row) return 0;
  
  // If numeric duration is provided directly
  if (typeof durationStr === 'number') {
    return durationStr;
  }

  // Try to parse direct hour value
  const directHours = parseFloat(durationStr as string);
  if (!isNaN(directHours)) {
    return directHours;
  }

  // Parse duration from Chinese format (X小时Y分钟)
  const chinesePattern = /(\d+)小时\s*(?:(\d+)分钟?)?/;
  const chineseMatch = durationStr?.match?.(chinesePattern) || 
                      row?.Title?.match?.(chinesePattern);
  
  if (chineseMatch) {
    const hours = parseInt(chineseMatch[1]) || 0;
    const minutes = parseInt(chineseMatch[2]) || 0;
    return hours + minutes / 60;
  }

  // Calculate from start and end dates if available
  if (row?.['Start date'] && row?.['End date']) {
    const startDate = parseDate(row['Start date']);
    const endDate = parseDate(row['End date']);
    
    if (startDate && endDate) {
      return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    }
  }

  return 0;
}

export function parseTimeviewCsv(csvString: string): TimeEntry[] {
  // Common instruction messages to filter out
  const instructionMessages = [
    '如需隐藏节假日',
    'To hide observances',
    'This is a half-day holiday',
    '这是半天假',
    '请前往 Google 日历的"设置"',
    'Go to Google Calendar settings',
    '中国节假日',
    'Chinese holidays'
  ];

  const results = Papa.parse<CsvRow>(csvString, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: true,
    transform: (value: string) => (value || '').trim(),
    transformHeader: (header: string) => header.trim()
  });

  return (results.data || [])
    .filter((row: CsvRow) => {
      // Skip rows that don't have required fields
      if (!row['Start date']) return false;

      // Skip rows that contain instruction messages in any field
      const rowValues = Object.values(row).map(val => String(val || '').toLowerCase());
      return !instructionMessages.some(msg => 
        rowValues.some(val => val.includes(msg.toLowerCase()))
      );
    })
    .map((row: CsvRow) => {
      try {
        // Parse start date
        const startDate = parseDate(row['Start date']);
        if (!startDate) return null;

        // Extract duration
        const duration = parseDuration(row.Duration, row);

        // Extract tags and clean title
        const tags: string[] = [];
        let title = row.Title || '';
        
        // Extract tags from [tag] format
        title = title.replace(/\[(.*?)\]/g, (_: string, tag: string) => {
          if (tag.startsWith('#')) {
            tags.push(tag.substring(1));
          }
          return '';
        });

        // Clean up title
        title = title
          .replace(/\(.*?\)/g, '') // Remove parenthetical content
          .replace(/\s+/g, ' ')    // Normalize whitespace
          .trim();

        return {
          date: normalizeDate(startDate),
          duration: Math.max(duration, 0.1), // Minimum duration of 0.1 hours
          title: title || 'Untitled Event', // Provide default title
          note: row.Notes || '',
          category: tags[0] || '',
          tags
        } as TimeEntry;
      } catch (error) {
        // Silently skip problematic rows
        console.log('Error parsing row:', error, row);
        return null;
      }
    })
    .filter((entry: TimeEntry | null): entry is TimeEntry => entry !== null);
}

export function parseTimeviewJson(jsonString: string): TimeEntry[] {
  try {
    const data = JSON.parse(jsonString);
    
    // Map for deduplication, key is date + title combination
    const uniqueEvents = new Map<string, TimeEntry>();
    
    data.forEach((item: Record<string, unknown>) => {
      try {
        const title = (item.title as string) || (item.name as string) || (item.summary as string) || '';
        const note = (item.note as string) || (item.notes as string) || (item.description as string) || (item.desc as string) || '';
        const category = (item.category as string) || (item.type as string) || '';
        const tags = Array.isArray(item.tags) ? item.tags as string[] : 
          (typeof item.tags === 'string' ? (item.tags as string).split(',').map(t => t.trim()) : []);

        // Process date
        let date: Date | null = null;
        const rawDateValue = item.date || item.startDate || item.start_date;
        const dateStr = typeof rawDateValue === 'string' ? rawDateValue : '';
        
        // Try parsing MM/DD/YY format
        const mmddyyMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})/);
        if (mmddyyMatch) {
          const [, month, day, year] = mmddyyMatch;
          date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        
        // If above format fails, try standard format
        if (!date || isNaN(date.getTime())) {
          date = new Date(dateStr);
        }
        
        if (!date || isNaN(date.getTime())) {
          console.error('Invalid date:', dateStr);
          return;
        }

        // Process duration
        let duration = 1;
        if (item.duration) {
          duration = parseFloat(item.duration.toString());
        } else if (item.endDate) {
          const endDateStr = typeof item.endDate === 'string' ? item.endDate : '';
          const endDate = new Date(endDateStr);
          if (!isNaN(endDate.getTime())) {
            duration = Math.max((endDate.getTime() - date.getTime()) / (1000 * 60 * 60), 1);
          }
        }

        // Skip instruction text
        if (title.includes('如需隐藏节假日') || 
            title.includes('To hide observances') ||
            note.includes('如需隐藏节假日') ||
            note.includes('To hide observances')) {
          return;
        }

        const event: TimeEntry = {
          date: normalizeDate(date),
          duration: duration || 1,
          title: title || 'Untitled',
          note,
          category,
          tags
        };

        // Use date and title combination as unique key
        const key = `${date.toISOString()}_${title}`;
        
        // If same event exists, keep the longer description
        const existing = uniqueEvents.get(key);
        if (!existing || (note && (!existing.note || note.length > existing.note.length))) {
          uniqueEvents.set(key, event);
        }
      } catch (error) {
        console.error('Error parsing event:', error, item);
      }
    });

    return Array.from(uniqueEvents.values());
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
}

export function parseICS(icsString: string): TimeEntry[] {
  const events: TimeEntry[] = [];
  // Handle multi-line fields, continuation lines in ICS format start with a space
  const lines = icsString
    .split(/\r\n|\r|\n/)
    .reduce((acc: string[], line: string) => {
      if (line.startsWith(' ')) {
        // Continuation line, append to previous line
        acc[acc.length - 1] = acc[acc.length - 1] + line.substring(1);
      } else {
        acc.push(line);
      }
      return acc;
    }, []);
  
  let currentEvent: Partial<TimeEntry> = {};
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
      continue;
    }
    
    if (!inEvent) continue;

    if (line === 'END:VEVENT') {
      if (currentEvent.date && currentEvent.title) {
        events.push({
          date: currentEvent.date,
          duration: currentEvent.duration || 1,
          title: currentEvent.title,
          note: currentEvent.note || '',
          category: currentEvent.category || '',
          tags: currentEvent.tags || []
        });
      }
      inEvent = false;
      continue;
    }

    // Parse event properties
    if (line.startsWith('DTSTART')) {
      try {
        const [params, value] = line.includes(';') ? 
          line.split(':').map(part => part.trim()) : 
          ['', line.split(':')[1]];
        
        let dateStr = value;
        
        // Handle dates with timezone
        if (params.includes('TZID=')) {
          const tzid = params.split('TZID=')[1].split(';')[0];
          // Convert YYYYMMDDTHHMMSS to ISO format
          dateStr = dateStr.replace(
            /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
            '$1-$2-$3T$4:$5:$6'
          );
          // Add timezone offset
          if (tzid.includes('Shanghai') || tzid.includes('Taipei')) {
            dateStr += '+08:00';
          }
        }
        // Handle basic date format (YYYYMMDD)
        else if (!dateStr.includes('T')) {
          dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}T00:00:00+08:00`;
        }
        // Handle dates with time
        else {
          dateStr = dateStr.replace(
            /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/,
            '$1-$2-$3T$4:$5:$6+08:00'
          );
        }
        
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          currentEvent.date = normalizeDate(date);
        }
      } catch (error) {
        console.error('Error parsing date:', line, error);
      }
    }
    
    else if (line.startsWith('DTEND') && !currentEvent.duration) {
      try {
        // Calculate duration from end time
        const endDateStr = line.split(':')[1];
        const endDate = new Date(endDateStr);
        if (currentEvent.date && !isNaN(endDate.getTime())) {
          const durationHours = (endDate.getTime() - currentEvent.date.getTime()) / (1000 * 60 * 60);
          currentEvent.duration = Math.max(durationHours, 1);
        }
      } catch (error) {
        console.error('Error parsing end date:', line, error);
      }
    }
    
    else if (line.startsWith('DURATION') && !currentEvent.duration) {
      const durationStr = line.includes('PT') ? line.split('PT')[1] : line.split(':')[1];
      let duration = 0;
      
      const hoursMatch = durationStr.match(/(\d+)H/);
      if (hoursMatch) duration += parseInt(hoursMatch[1]);
      
      const minutesMatch = durationStr.match(/(\d+)M/);
      if (minutesMatch) duration += parseInt(minutesMatch[1]) / 60;
      
      const secondsMatch = durationStr.match(/(\d+)S/);
      if (secondsMatch) duration += parseInt(secondsMatch[1]) / 3600;
      
      currentEvent.duration = Math.max(duration, 1);
    }
    
    else if (line.startsWith('SUMMARY')) {
      currentEvent.title = line.substring(line.indexOf(':') + 1)
        .replace(/\\,/g, ',')
        .replace(/\\\\/g, '\\')
        .trim();
    }
    
    else if (line.startsWith('DESCRIPTION')) {
      currentEvent.note = line.substring(line.indexOf(':') + 1)
        .replace(/\\n/g, '\n')
        .replace(/\\,/g, ',')
        .replace(/\\\\/g, '\\')
        .trim();
    }
    
    else if (line.startsWith('CATEGORIES')) {
      const categories = line.substring(line.indexOf(':') + 1)
        .split(',')
        .map(c => c.trim());
      currentEvent.category = categories[0] || '';
      currentEvent.tags = categories;
    }
  }

  return events;
} 