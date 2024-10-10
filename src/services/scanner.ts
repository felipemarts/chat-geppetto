
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

    // Implicitly ignore hidden files and directories
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

// Recursively list all files and directories, considering ignore patterns
function listFilesRecursively(dir: string, ignoredPatterns: string[]): string[] {
    let results: string[] = [];
    const items = fs.readdirSync(dir);

    items.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Check if file or directory is not ignored
        if (!isIgnored(filePath, ignoredPatterns, dir)) {
            if (stat.isDirectory()) {
                results = results.concat(listFilesRecursively(filePath, ignoredPatterns));
            } else {
                results.push(filePath);
            }
        }
    });

    return results;
}

// Populate files with all non-ignored files from the project
export function populateFiles(projectPath: string): Action[] {
    const files: Action[] = [];
    const ignoredPatterns = getIgnoredPatterns(projectPath);
    const allFiles = listFilesRecursively(projectPath, ignoredPatterns);
  
    allFiles.forEach(completePath => {
        files.push({
            name: path.basename(completePath),
            content: path.relative(projectPath, completePath)
        });
    });

    // Sort the files alphabetically by name
    files.sort((a, b) => a.name.localeCompare(b.name));

    return files;
}

// Function to generate Markdown tree
export function generateMarkdownTree(dir: string): string {
    const ignoredPatterns = getIgnoredPatterns(dir);
    const markdownLines: string[] = [];
    generateTree(dir, '', ignoredPatterns, markdownLines);
    return `\`\`\`md\n${markdownLines.join('\n')}\n\`\`\``;
}

// Helper function to generate file tree and append to markdownLines
function generateTree(dir: string, prefix: string, ignoredPatterns: string[], markdownLines: string[]) {
    const items = fs.readdirSync(dir);

    items.forEach((item, index) => {
        const filePath = path.join(dir, item);
        
        // Ignore files based on patterns
        if (isIgnored(filePath, ignoredPatterns, dir)) {
            return;
        }
        
        const isLast = index === items.length - 1;
        const isDir = fs.statSync(filePath).isDirectory();

        // Create the tree structure like "|-- filename"
        const prefixSymbol = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        markdownLines.push(`${prefix}${prefixSymbol}${item}`);

        // If directory, recursively add its content
        if (isDir) {
            generateTree(filePath, prefix + childPrefix, ignoredPatterns, markdownLines);
        }
    });
}