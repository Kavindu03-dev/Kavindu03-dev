# Contribution Graph Generator

This repository contains a custom script (`generate-svg.cjs`) to generate SVG contribution animations for GitHub profiles.

## Features

- Generates both light and dark theme SVG contribution graphs
- Fetches real-time contribution data from GitHub API
- Customizable color schemes
- Interactive tooltips showing contribution counts
- Automatic deployment to `output` branch via GitHub Actions

## Usage

### Automatic Generation (Recommended)

The GitHub Actions workflow automatically generates new SVGs every 12 hours and on manual trigger:

1. Go to the "Actions" tab in your repository
2. Select "Generate Contribution Graph" workflow
3. Click "Run workflow"

### Manual Generation

To generate SVGs locally:

```bash
# Install Node.js (v14 or higher)
# Set your GitHub token
export GITHUB_TOKEN=your_github_token

# Run the generator
node generate-svg.cjs [username]
```

The generated SVGs will be saved in the `dist/` directory:
- `contribution-graph.svg` - Light theme
- `contribution-graph-dark.svg` - Dark theme

## Integration in README

Add the contribution graph to your README using:

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Kavindu03-dev/Kavindu03-dev/output/contribution-graph-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Kavindu03-dev/Kavindu03-dev/output/contribution-graph.svg">
  <img alt="github contribution graph" src="https://raw.githubusercontent.com/Kavindu03-dev/Kavindu03-dev/output/contribution-graph.svg">
</picture>
```

## Workflows

This repository includes two workflows for contribution animations:

1. **Generate Pacman Contribution Graph** (`pacman.yml`)
   - Uses Platane/snk@v3 to create a Pacman-style animation
   - Generates `pacman-contribution-graph.svg` and `pacman-contribution-graph-dark.svg`

2. **Generate Contribution Graph** (`generate-svg.yml`)
   - Uses the custom `generate-svg.cjs` script
   - Generates `contribution-graph.svg` and `contribution-graph-dark.svg`

Both workflows run every 12 hours and can be triggered manually.

## Requirements

- Node.js v14 or higher
- GitHub Personal Access Token with `read:user` scope

## License

MIT
