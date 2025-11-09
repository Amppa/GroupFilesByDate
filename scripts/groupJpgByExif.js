// File Organizer - Organize photos by EXIF
// Copyright (C) 2025 Amppa
//
// Automatically moves photos into date-based folders (YYYY-MM-DD format)
// based on their EXIF shooting date.
//
// Version: 2025-11-09.004

var shell = WScript.CreateObject("WScript.Shell");
var fso = WScript.CreateObject("Scripting.FileSystemObject");

var VB = { okCancel: 1, info: 64, warning: 48, cancel: 2 };
var EXIF_TAG_DATE = 36867;

main();

function main() {
    var basePath = getScriptFolder();
    var jpgCount = countJpgFiles(basePath);

    if (jpgCount === 0) {
        WScript.Echo("No JPG or JPEG files found in this directory.");
        return;
    }

    if (!confirmStart(jpgCount)) return;

    var fileData = extractExifDates(basePath);
    var stats = moveFilesToDateFolders(fileData, basePath);

    showSummary(stats);
}

function confirmStart(count) {
    var msg =
        "  Purpose: Organize photos into folders by EXIF shooting date.\n\n" +
        "  Number of JPG in current folder: " + count + "\n\n" +
        "  Press [OK] to continue, or [Cancel] to abort.";
    return shell.Popup(msg, 0, "Sort by EXIF Date", VB.okCancel + VB.info) !== VB.cancel;
}

function showSummary(stats) {
    var msg =
        "  Move Complete!\n\n" +
        "  Folders created: " + stats.created + "\n\n" +
        "  Files moved: " + stats.moved + "\n\n" +
        "  Files skipped: " + stats.skipped;
    shell.Popup(msg, 0, "Sort by EXIF Date - Completed", VB.info);
}

function countJpgFiles(path) {
    var folder = fso.GetFolder(path);
    var files = new Enumerator(folder.Files);
    var count = 0;
    for (; !files.atEnd(); files.moveNext()) {
        if (isJpgFile(files.item().Name)) count++;
    }
    return count;
}

function isJpgFile(name) {
    return /\.jpe?g$/i.test(name);
}

function extractExifDates(basePath) {
    var psCmd = buildPsCommand(basePath);
    var output = executePowerShell(psCmd);
    return parseExifOutput(output);
}

function buildPsCommand(basePath) {
    var safePath = basePath.replace(/'/g, "''");
    var ps = "$ErrorActionPreference='SilentlyContinue';";
    ps += "Add-Type -AssemblyName System.Drawing;";
    ps += "$files=Get-ChildItem -LiteralPath '" + safePath + "' -File|Where{$_.Extension-match'(?i)\\.jpe?g$'};";
    ps += "foreach($f in $files){";
    ps += "try{";
    ps += "$img=[System.Drawing.Image]::FromFile($f.FullName);";
    ps += "$prop=$img.PropertyItems|Where{$_.Id-eq " + EXIF_TAG_DATE + "}|Select -First 1;";
    ps += "if($prop){";
    ps += "$enc=New-Object System.Text.ASCIIEncoding;";
    ps += "$raw=$enc.GetString($prop.Value)-replace[char]0,'';";
    ps += "Write-Output($f.Name+'|'+$raw);";
    ps += "}else{Write-Output($f.Name+'|NO_EXIF');}";
    ps += "$img.Dispose();";
    ps += "}catch{Write-Output($f.Name+'|ERROR');}";
    ps += "}";
    return ps;
}

function executePowerShell(psCmd) {
    var cmd = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "' + psCmd.replace(/"/g, '\\"') + '"';
    var exec;
    try {
        exec = shell.Exec(cmd);
    } catch (e) {
        WScript.Echo("Error: PowerShell not available. " + e.message);
        WScript.Quit(1);
    }

    var lines = [];
    try {
        while (!exec.StdOut.AtEndOfStream) {
            var line = exec.StdOut.ReadLine();
            if (line) lines.push(line);
        }
    } catch (e) {
        WScript.Echo("Error reading PowerShell output: " + e.message);
    }
    return lines;
}

function parseExifOutput(lines) {
    var results = [];
    for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split("|");
        if (parts.length !== 2) continue;
        
        var fileName = parts[0].replace(/^\s+|\s+$/g, '');
        var dateStr = parts[1].replace(/^\s+|\s+$/g, '');
        
        if (dateStr === "NO_EXIF" || dateStr === "ERROR" || !dateStr) continue;
        
        var dateObj = parseExifDate(dateStr);
        if (dateObj) {
            results.push({ file: fileName, date: dateObj });
        }
    }
    return results;
}

function parseExifDate(str) {
    var match = str.match(/^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
        return new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
    }
    var timestamp = Date.parse(str);
    return isNaN(timestamp) ? null : new Date(timestamp);
}

function moveFilesToDateFolders(fileData, basePath) {
    var stats = { created: 0, moved: 0, skipped: fileData.initialCount - fileData.length };
    var createdFolders = {};

    for (var i = 0; i < fileData.length; i++) {
        var item = fileData[i];
        var folderName = formatDate(item.date);
        var destFolder = basePath + folderName;
        var srcPath = basePath + item.file;
        var destPath = destFolder + "\\" + item.file;

        if (!createdFolders[folderName] && !fso.FolderExists(destFolder)) {
            try {
                fso.CreateFolder(destFolder);
                createdFolders[folderName] = true;
                stats.created++;
            } catch (e) {
                stats.skipped++;
                continue;
            }
        }

        if (fso.FileExists(destPath)) {
            shell.Popup("Duplicate file:\n" + destPath + "\n\nStopped.", 0, "File Conflict", VB.warning);
            WScript.Quit(1);
        }

        try {
            fso.MoveFile(srcPath, destPath);
            stats.moved++;
        } catch (e) {
            stats.skipped++;
        }
    }

    return stats;
}

function formatDate(d) {
    function pad(n) { return n < 10 ? "0" + n : n; }
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function getScriptFolder() {
    var full = WScript.ScriptFullName;
    return full.substr(0, full.lastIndexOf("\\") + 1);
}