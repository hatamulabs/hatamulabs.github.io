#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the Fabricator projects directory
// Can be overridden via PROJECTS_DIR environment variable
const PROJECTS_DIR = process.env.PROJECTS_DIR
    ? path.resolve(process.env.PROJECTS_DIR)
    : path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(__dirname, 'projects.json');

function getGitCreationDate(projectPath) {
    try {
        // Get the date of the first commit
        const date = execSync(
            'git log --reverse --format=%aI | head -1',
            { cwd: projectPath, encoding: 'utf-8' }
        ).trim();
        return date || new Date().toISOString();
    } catch (error) {
        console.warn(`Could not get git date for ${projectPath}, using current date`);
        return new Date().toISOString();
    }
}

function getProjectDescription(projectPath) {
    try {
        const readmePath = path.join(projectPath, 'README.md');
        if (!fs.existsSync(readmePath)) {
            return 'No description available.';
        }

        const content = fs.readFileSync(readmePath, 'utf-8');
        const lines = content.split('\n');

        // Look for the first substantial paragraph after the title
        // Skip the title line (starts with #) and empty lines
        let foundTitle = false;
        for (const line of lines) {
            const trimmed = line.trim();

            // Skip title
            if (trimmed.startsWith('#')) {
                foundTitle = true;
                continue;
            }

            // Skip empty lines
            if (!trimmed) continue;

            // Skip lines that are just markdown formatting
            if (trimmed.startsWith('```') || trimmed.startsWith('---')) continue;

            // Found a substantial line - use it as description
            if (foundTitle && trimmed.length > 10) {
                // Remove markdown formatting and trim to one line
                let description = trimmed
                    .replace(/\*\*/g, '') // Remove bold
                    .replace(/\*/g, '')   // Remove italic
                    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
                    .replace(/`/g, '');   // Remove code formatting

                // Truncate if too long
                if (description.length > 120) {
                    description = description.substring(0, 117) + '...';
                }

                return description;
            }
        }

        return 'No description available.';
    } catch (error) {
        console.warn(`Could not get description for ${projectPath}`);
        return 'No description available.';
    }
}

function getProjectStatus(projectPath) {
    try {
        // Check if there's a progress file
        const files = fs.readdirSync(projectPath);
        const progressFiles = files.filter(f => f.startsWith('progress-') && f.endsWith('.md'));

        if (progressFiles.length > 0) {
            // Read the most recent progress file to determine status
            progressFiles.sort().reverse();
            const progressContent = fs.readFileSync(
                path.join(projectPath, progressFiles[0]),
                'utf-8'
            ).toLowerCase();

            if (progressContent.includes('complete') || progressContent.includes('done')) {
                return 'Active';
            }
        }

        // Check last commit date - if recent, it's in development
        try {
            const lastCommitDate = execSync(
                'git log -1 --format=%aI',
                { cwd: projectPath, encoding: 'utf-8' }
            ).trim();

            const daysSinceLastCommit = Math.floor(
                (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastCommit < 7) {
                return 'In Development';
            } else if (daysSinceLastCommit < 30) {
                return 'Active';
            } else {
                return 'Archived';
            }
        } catch (error) {
            return 'In Development';
        }
    } catch (error) {
        return 'In Development';
    }
}

function getGitLastUpdatedDate(projectPath) {
    try {
        const date = execSync(
            'git log -1 --format=%aI',
            { cwd: projectPath, encoding: 'utf-8' }
        ).trim();
        return date || new Date().toISOString();
    } catch (error) {
        console.warn(`Could not get last updated date for ${projectPath}`);
        return new Date().toISOString();
    }
}

function scanProjects() {
    const projects = [];

    try {
        const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const projectName = entry.name;
            const projectPath = path.join(PROJECTS_DIR, projectName);

            // Skip the homepage itself and any hidden directories
            if (projectName === 'hatamulabs-homepage' || projectName.startsWith('.')) {
                continue;
            }

            // Check if it's a git repository
            const gitDir = path.join(projectPath, '.git');
            if (!fs.existsSync(gitDir)) {
                console.warn(`Skipping ${projectName} - not a git repository`);
                continue;
            }

            // Get project metadata
            const created = getGitCreationDate(projectPath);
            const lastUpdated = getGitLastUpdatedDate(projectPath);
            const status = getProjectStatus(projectPath);
            const description = getProjectDescription(projectPath);

            projects.push({
                name: projectName,
                description: description,
                created: created,
                lastUpdated: lastUpdated,
                status: status
            });
        }

        // Sort by creation date (newest first)
        projects.sort((a, b) => new Date(b.created) - new Date(a.created));

        return projects;
    } catch (error) {
        console.error('Error scanning projects:', error);
        return [];
    }
}

function main() {
    console.log('Scanning projects in:', PROJECTS_DIR);
    const projects = scanProjects();

    console.log(`Found ${projects.length} projects`);
    projects.forEach(p => {
        console.log(`  - ${p.name} (${p.status})`);
    });

    // Write to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    console.log(`\nProjects data written to: ${OUTPUT_FILE}`);
}

main();
