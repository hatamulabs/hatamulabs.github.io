# GitHub Pages Setup Summary

## Completed Configuration

### Repository Settings
- **Visibility**: Changed to public (required for free GitHub Pages)
- **GitHub Pages**: Enabled at https://hatamulabs.github.io/hatamulabs-homepage/
- **Build Type**: GitHub Actions workflow

### Workflows Created

#### 1. Deploy Workflow (`.github/workflows/deploy.yml`)
- Triggers: On push to main, manual dispatch
- Deploys the static site to GitHub Pages
- Status: Active and running

#### 2. Update Projects Workflow (`.github/workflows/update-projects.yml`)
- Triggers: Daily at 00:00 UTC, manual dispatch
- Checks out parent Fabricator repository
- Regenerates `projects.json` with latest project data
- Commits and pushes if changes detected
- Status: Configured, will run on schedule

### Repository Secrets
The following secrets have been configured:

- `FABRICATOR_REPO`: hatamulabs/fabricator
- `FABRICATOR_TOKEN`: GitHub PAT with repo access

### Files Modified

1. `generate-projects.js` - Updated to accept `PROJECTS_DIR` environment variable
2. `README.md` - Added automated updates documentation
3. `.github/workflows/update-projects.yml` - New daily update workflow

## How It Works

1. **Daily at 00:00 UTC**: The update workflow runs automatically
2. **Workflow steps**:
   - Checks out the homepage repository
   - Checks out the Fabricator parent repository
   - Initializes all submodules (projects)
   - Runs `generate-projects.js` to scan projects
   - Compares generated `projects.json` with current version
   - Commits and pushes if changes detected
3. **On push to main**: Deploy workflow triggers automatically
4. **Result**: Site is updated with latest project list

## Site URL

https://hatamulabs.github.io/hatamulabs-homepage/

## Manual Operations

### Manually trigger project update
```bash
# Via GitHub UI: Actions > Update Projects List > Run workflow

# Or via API
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer TOKEN" \
  https://api.github.com/repos/hatamulabs/hatamulabs-homepage/actions/workflows/update-projects.yml/dispatches \
  -d '{"ref":"main"}'
```

### Test locally
```bash
cd /home/gudgud96/claude-projects/fabricator/projects/hatamulabs-homepage
npm run build
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Notes

- The repository is PUBLIC (GitHub Pages requirement for free plan)
- The homepage does NOT expose repository URLs or sensitive info
- Only project names, creation dates, and status are displayed
- The workflow will maintain the projects list automatically
