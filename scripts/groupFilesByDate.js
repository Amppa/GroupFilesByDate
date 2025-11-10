// File Organizer - Organize files by last modified date
// Copyright (C) 2025 Amppa
//
// Automatically moves files into date-based folders (YYYY-MM-DD format)
// based on their last modified date (not created date or EXIF date).
// Inspired by work from Yulin Huang.
//
// Version: 2025.002

var vbOKCancel = 1, vbInformation = 64, vbCancel = 2;

// --- Create required COM objects ---
var shell = WScript.CreateObject("WScript.Shell");
var fso = WScript.CreateObject("Scripting.FileSystemObject");

main();
function main() {
    var startTime = new Date();
    
    var script = getScriptInfo(); // { dir, name }
    var folder = fso.GetFolder(shell.ExpandEnvironmentStrings(script.dir));
    var fileCount = countNonJsFiles(folder);

    // --- Initial popup ---
    var initMsg =
        "  Purpose: Organize files into folders by last modified date.\n\n" +
        "  Number of files (excluding .js): " + fileCount + "\n\n" +
        "  Press [OK] to continue, or [Cancel] to abort.";
    var result = shell.Popup(initMsg, 0, "Sort by File Date", vbOKCancel + vbInformation);
    if (result === vbCancel) return;

    var resultData = moveFilesByDate(folder, script.dir);

    var endTime = new Date();
    var elapsedMs = endTime - startTime;
    var avgMs = resultData.movedCount > 0 ? Math.round(elapsedMs / resultData.movedCount) : 0;

    WScript.Echo(
        "  Move Complete!\n\n" +
        "  Created " + resultData.createdDirCount + " new folders.\n\n" +
        "  Moved " + resultData.movedCount + " files.\n\n" +
        "  Average time per file: " + avgMs + " ms."
    );
}

// --- Move non-.js files into folders by last modified date ---
function moveFilesByDate(folder, baseDir) {
    var e = new Enumerator(folder.Files);
    var movedCount = 0, createdDirCount = 0;

    for (; !e.atEnd(); e.moveNext()) {
        var file = e.item();
        var name = file.Name.toLowerCase();

        // Skip any .js file
        if (name.slice(-3) === ".js") continue;

        var date = new Date(file.DateLastModified);
        var yyyy = date.getFullYear();
        var mm = padZero(date.getMonth() + 1);
        var dd = padZero(date.getDate());

        var destFolder = baseDir + yyyy + "-" + mm + "-" + dd;
        var destPath = destFolder + "\\" + file.Name;

        if (!fso.FolderExists(destFolder)) {
            fso.CreateFolder(destFolder);
            createdDirCount++;
        }

        file.Move(destPath);
        movedCount++;
    }

    return { createdDirCount: createdDirCount, movedCount: movedCount };
}

// --- Count non-.js files ---
function countNonJsFiles(folder) {
    var e = new Enumerator(folder.Files);
    var count = 0;
    for (; !e.atEnd(); e.moveNext()) {
        var f = e.item();
        var n = f.Name.toLowerCase();
        if (n.slice(-3) !== ".js") count++;
    }
    return count;
}

// --- Helpers ---
function getScriptInfo() {
    var full = WScript.ScriptFullName;
    var i = full.lastIndexOf("\\");
    return { dir: full.substr(0, i + 1), name: full.substr(i + 1) };
}

function padZero(n) {
    n = String(n);
    return (n.length === 1) ? "0" + n : n;
}
