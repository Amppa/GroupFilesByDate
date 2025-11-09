# File Organizer Scripts

Two JScript tools to automatically organize files into date-based folders (YYYY-MM-DD format).

## Scripts Overview

| Script | Files Processed | Date Source | Speed |
|--------|----------------|-------------|-------|
| `groupFilesByDate.js` | All files (except .js) | Last Modified Date | Fast ⚡ |
| `groupJpgByExif.js` | JPG/JPEG only | EXIF Shooting Date | Slower |

## Features

- Creates folders named by date (e.g., `2025-11-09`)
- Automatically moves files into corresponding date folders
- Reports number of folders created and files moved
- Prevents duplicate file overwrites

## Requirements

- **Operating System**: Windows (tested on Windows 10 & 11)
- **Runtime**: Windows Script Host (WScript)
- **No installation required** - uses built-in Windows components 😎

## Usage

Both scripts follow the same usage pattern:

1. **Place the script in the target folder**

2. **Run the script**
   - Double-click the `.js` file

3. **Confirm the operation**
   - A dialog will show the number of files to be processed
   
4. **Wait for processing**
   - Files will be moved into date-named folders progressively
   - `groupJpgByExif.js` will display a PowerShell window during processing

5. **Check the results**
   - A summary message shows folders created, files moved, and files skipped

## Example

**Before:**
```
📁 My Photos
  🖼️ photo1.jpg (modified: 2025-01-11)
  🖼️ photo2.jpg (modified: 2025-01-11)
  🖼️ photo3.jpg (modified: 2025-01-14)
  📄 document.pdf (modified: 2025-02-20)
  📜 groupFilesByDate.js
  📜 groupJpgByExif.js
```

**After (using groupFilesByDate.js):**
```
📁 My Photos
  📁 2025-01-11
    🖼️ photo1.jpg
    🖼️ photo2.jpg
  📁 2025-01-14
    🖼️ photo3.jpg
  📁 2025-02-20
    📄 document.pdf
  📜 groupFilesByDate.js
  📜 groupJpgByExif.js
```

**After (using groupJpgByExif.js):**
```
📁 My Photos
  📁 2025-01-11
    🖼️ photo1.jpg
    🖼️ photo2.jpg
  📁 2025-01-14
    🖼️ photo3.jpg
  📄 document.pdf (not moved)
  📜 groupFilesByDate.js
  📜 groupJpgByExif.js
```

## Notes

### groupFilesByDate.js
- Processes **all file types** except `.js` files
- Uses **DateLastModified** property (not created date or EXIF)

### groupJpgByExif.js
- Processes **JPG/JPEG files only**
- Uses **EXIF DateTimeOriginal** (shooting date from camera)
- **Slower** - requires PowerShell to extract EXIF data
- Photos without EXIF data are skipped (e.g., screenshoot, internet image)

## Performance Comparison

TODO


## Thanks
  
Inspired by work from Yulin Huang, 2013


## Version

- groupFilesByDate.js: 2025-11-09.001
- groupJpgByExif.js: 2025-11-09.004