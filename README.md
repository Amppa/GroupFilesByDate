# File Organizer

GroupFiles_byDate.js
Automatically organize files into date-based folders (YYYY-MM-DD format) based on their **last modified date**.

## Features

- Creates folders named by date (e.g., `2025-11-09`)
- Moves files based on their **last modified date** (not created date or EXIF date)
- Excludes `.js` files
- Reports number of folders created and files moved

## Requirements

- **Operating System**: Windows (tested on Windows 10 & 11)
- **Runtime**: Windows Script Host (WScript)
- **No installation required** - uses built-in Windows components

## Usage

1. **Place the script in the target folder**
   - The script must be in the same directory as the files you want to organize

2. **Run the script**
   - Double-click the `groupFilesByDate.js` file

## Example

**Before:**
```
📁 My Folder
  📄 photo1.jpg (modified: 2025-01-15)
  📄 photo2.jpg (modified: 2025-01-15)
  📄 document.pdf (modified: 2025-02-20)
  📜 groupFilesByDate.js
```

**After:**
```
📁 My Folder
  📁 2025-01-15
    📄 photo1.jpg
    📄 photo2.jpg
  📁 2025-02-20
    📄 document.pdf
  📜 groupFilesByDate.js
```

## Notes

- The script uses **DateLastModified** property, not file creation date or EXIF data
- `.js` files are excluded
- If a folder already exists, it will be reused (no duplicates)
- The script file itself will remain in the root directory

## Thanks
  
Inspired by work from Yulin Huang, 2013

## Version

2025-11-09.001