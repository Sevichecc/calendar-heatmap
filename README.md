# Calendar Heatmap

A beautiful and interactive calendar heatmap visualization tool built with Next.js and TypeScript. Import your time tracking data and visualize it in a GitHub-style heatmap.

## Features

- 📅 Interactive calendar heatmap visualization
- 📊 Support for multiple data formats:
  - JSON (Timeview format)
  - CSV
  - ICS (Calendar format)
- 🎨 Customizable appearance:
  - Multiple color themes
  - Adjustable intensity ranges
- 🔍 Advanced filtering:
  - Text search across titles, notes, categories, and tags
  - Duration-based filtering
- 📤 Export capabilities:
  - Export as PNG in various sizes
  - Custom title and user ID in exports
  - Live preview before export
- 💻 Modern tech stack:
  - Next.js 14 with App Router
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- npm or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/calendar-heatmap.git
cd calendar-heatmap
```

2. Install dependencies:
```bash
# Using npm
npm install

# Using bun
bun install
```

3. Start the development server:
```bash
# Using npm
npm run dev

# Using bun
bun run dev
```

Visit `http://localhost:3000` to see the application.

## Usage

1. Click the "Import Data" button to upload your time tracking data
2. Supported file formats:
   - JSON files from Timeview
   - CSV files with date, duration, and title columns
   - ICS calendar files
3. Use the filters to search and filter your data
4. Adjust the color ranges to customize the visualization
5. Export your heatmap as an image using the export button

## Data Format Examples

### JSON Format
```json
[
  {
    "date": "2024-01-01",
    "duration": 2.5,
    "title": "Project Work",
    "note": "Working on feature X",
    "category": "Development",
    "tags": ["coding", "feature"]
  }
]
```

### CSV Format
```csv
date,duration,title,note,category,tags
2024-01-01,2.5,"Project Work","Working on feature X","Development","coding;feature"
```

## Data Sources
- **macOS Calendar**: Export your calendar as `.ics` file via `File > Export`
- **[TimeView](https://apps.apple.com/us/app/timeview-calendar-statistics/id1439197028)**: Export data as JSON or CSV via button below calendar.

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT @Sevi.C, thanks to [塔塔](https://mantyke.icu/), without whom this App would not have been possible.