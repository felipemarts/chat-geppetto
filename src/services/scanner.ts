import fs from 'fs';
import path from 'path';
import { Action } from '../types';

// Load ignore patterns from a given file
function loadIgnorePatterns(filePath: string): string[] {
    if (!fs.existsSync(filePath)) {
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#')); // Filter out empty lines and comments
}

// Retrieve ignored patterns from .gitignore and .hidebot files
function getIgnoredPatterns(dir: string): string[] {
    const gitignorePath = path.join(dir, '.gitignore');
    const hidebotPath = path.join(dir, '.hidebot');

    const gitIgnorePatterns = loadIgnorePatterns(gitignorePath);
    const hidebotPatterns = loadIgnorePatterns(hidebotPath);

    return [...gitIgnorePatterns, ...hidebotPatterns];
}

// Determine if an item should be ignored based on ignored patterns
function isIgnored(item: string, ignoredPatterns: string[], dir: string): boolean {
    const relativePath = path.relative(dir, item);
    const itemName = path.basename(relativePath);

    // Check if the item is part of the .geppetto directory
    if (relativePath.startsWith('.geppetto')) {
        return false; // Always include .geppetto
    }

    // Implicitly ignore hidden files and directories except for .geppetto
    if (itemName.startsWith('.')) {
        return true;
    }

    // Match item against ignore patterns
    return ignoredPatterns.some(pattern => {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special characters
        const regexPattern = pattern
            .replace(/\\\*/g, '.*')         // Convert glob * to regex
            .replace(/\/$/, '(\\/.*)?$');  // Handle trailing slash in directory patterns
        const regex = new RegExp(`^${regexPattern}`);
        return regex.test(relativePath);
    });
}

// Populate files with all non-ignored files from the project
export function populateFiles(projectPath: string): Action[] {
    const files: Action[] = [];
    const ignoredPatterns = getIgnoredPatterns(projectPath);

    const filePaths: string[] = [];

    listFilePaths(projectPath, ignoredPatterns, filePaths, projectPath);
    filePaths.forEach(completePath => {
        files.push({
            name: path.basename(completePath),
            content: completePath
        });
    });
    files.sort((a, b) => a.name.localeCompare(b.name));

    return files;
}

// Function to generate a simple list of file paths
export function generateFileList(dir: string): string {
    const ignoredPatterns = getIgnoredPatterns(dir);
    const filePaths: string[] = [];

    listFilePaths(dir, ignoredPatterns, filePaths, dir);

    return filePaths.join('\n');
}

// Helper function to recursively collect file paths
function listFilePaths(currentDir: string, ignoredPatterns: string[], filePaths: string[], rootDir: string) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
        const filePath = path.join(currentDir, item);

        // Ignore files based on patterns
        if (isIgnored(filePath, ignoredPatterns, rootDir)) {
            return;
        }

        const stat = fs.statSync(filePath);

        // Add file path to list if it's a file
        if (!stat.isDirectory()) {
            filePaths.push(path.relative(rootDir, filePath));
        } else {
            listFilePaths(filePath, ignoredPatterns, filePaths, rootDir);
        }
    });
}
