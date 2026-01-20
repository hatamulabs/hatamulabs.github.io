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

### Automated Updates

A GitHub Actions workflow runs daily to automatically update the projects list:

1. The workflow checks out the parent Fabricator repository
2. Scans all projects and regenerates `projects.json`
3. Commits and pushes changes if projects have been added/updated
4. GitHub Pages automatically deploys the updated site

### GitHub Secrets Required

For the automated workflow to work, configure these repository secrets:

- `FABRICATOR_REPO`: The full repository path (e.g., `username/fabricator`)
- `FABRICATOR_TOKEN`: A personal access token with repo access to the Fabricator repository

### Manual Updates

You can also manually trigger the workflow from the Actions tab or run locally:

```bash
npm run build
git add projects.json
git commit -m "[chore] Update projects list"
git push
```

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
