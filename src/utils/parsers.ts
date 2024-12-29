interface TimeEntry {
  date: Date;
  duration: number;
  title: string;
  note?: string;
  category?: string;
  tags?: string[];
}

function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i++;
      } else {
        // Toggle quotes mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Push the last field
  result.push(current.trim());
  return result;
}

export function parseTimeviewJson(jsonString: string): TimeEntry[] {
  try {
    const data = JSON.parse(jsonString);
    
    // Map for deduplication, key is date + title combination
    const uniqueEvents = new Map<string, TimeEntry>();
    
    data.forEach((item: any) => {
      try {
        const title = item.title || item.name || item.summary || '';
        const note = item.note || item.notes || item.description || item.desc || '';
        const category = item.category || item.type || '';
        const tags = Array.isArray(item.tags) ? item.tags : 
          (typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()) : []);

        // Process date
        let date: Date | null = null;
        const dateStr = item.date || item.startDate || item.start_date;
        
        // Try parsing MM/DD/YY format
        const mmddyyMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})/);
        if (mmddyyMatch) {
          const [_, month, day, year] = mmddyyMatch;
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
          const endDate = new Date(item.endDate);
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

export function parseTimeviewCsv(csvString: string): TimeEntry[] {
  // Handle different line endings by normalizing to \n
  const lines = csvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  
  // Skip empty lines and header/instruction lines
  const entries = lines
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      
      // Skip instruction lines
      if (trimmed.startsWith('Start date') ||
          trimmed.startsWith('如需隐藏节假日') ||
          trimmed.startsWith('To hide observances') ||
          trimmed.includes('这是半天假') ||
          trimmed.includes('This is a half-day holiday')) {
        return false;
      }
      
      return true;
    })
    .map(line => {
      try {
        const [dateStr, durationStr, title, note = '', category = '', tagsStr = ''] = 
          parseCSVLine(line);
        
        // Try different date formats
        let date: Date | null = null;
        
        // Try MM/DD/YY format first
        const mmddyyMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})/);
        if (mmddyyMatch) {
          const [_, month, day, year] = mmddyyMatch;
          date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        
        // If that fails, try standard ISO format
        if (!date || isNaN(date.getTime())) {
          date = new Date(dateStr);
        }
        
        if (!date || isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${dateStr}`);
        }

        const duration = parseFloat(durationStr);
        if (isNaN(duration)) {
          throw new Error(`Invalid duration: ${durationStr}`);
        }
        
        return {
          date: normalizeDate(date),
          duration: duration || 1,
          title: title || 'Untitled',
          note,
          category,
          tags: tagsStr ? tagsStr.split(';').map((t: string) => t.trim()) : []
        } as TimeEntry;
      } catch (error) {
        console.error('Error parsing CSV line:', error);
        return null;
      }
    })
    .filter((entry): entry is TimeEntry => entry !== null);

  return entries;
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