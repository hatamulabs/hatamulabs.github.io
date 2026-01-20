# Hatamu Labs Homepage

The official homepage for Hatamu Labs - a next-generation automated software building laboratory.

## Overview

This static website showcases Hatamu Labs' mission and projects. It's built to:
- Introduce Hatamu Labs as an AI-driven software development lab
- Display all active projects from the Fabricator system
- Maintain privacy by not exposing private repository links

## Structure

- `index.html` - The main homepage with About and Projects sections
- `generate-projects.js` - Node.js script that scans the Fabricator projects directory
- `projects.json` - Generated file containing project metadata (name, creation date, status)
- `package.json` - Build configuration

## How It Works

1. The `generate-projects.js` script scans the parent `projects/` directory
2. For each project (git repository), it extracts:
   - Project name (directory name)
   - Creation date (from first git commit)
   - Status (based on recent activity and progress files)
3. Project metadata is written to `projects.json`
4. The homepage loads and displays this data dynamically

## Building

Run the build script to regenerate the projects list:

```bash
npm run build
```

This will scan all projects and update `projects.json`.

## Deployment

This site is deployed to GitHub Pages at `hatamulabs.github.io`.

### Workflow

Since this is a Git submodule of the Fabricator project:

1. When projects are added/updated in Fabricator, run `npm run build` from this directory to regenerate `projects.json`
2. Commit the updated `projects.json` file
3. Push to the repository
4. GitHub Pages will automatically deploy the updated site

**Note:** The `projects.json` file is committed to the repository. You need to manually rebuild it when projects change in the parent Fabricator repository.

## Development

To test locally:
1. Run `npm run build` to generate projects.json
2. Open `index.html` in a browser (use a local server to avoid CORS issues)

Example with Python:
```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

## Privacy

This homepage intentionally does NOT expose:
- GitHub repository URLs
- Direct links to private repositories
- Any sensitive project information

Only project names, creation dates, and status are displayed publicly.
