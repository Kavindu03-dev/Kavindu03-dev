#!/usr/bin/env node

/**
 * Generate SVG contribution animation
 * This script generates SVG animations from GitHub contribution data
 * 
 * Usage: node generate-svg.cjs [username]
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Configuration
const username = process.argv[2] || 'Kavindu03-dev';
const outputDir = path.join(__dirname, 'dist');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Generating SVG contribution animation for ${username}...`);

// GitHub GraphQL query to fetch contribution data
const query = `
  query($userName:String!) {
    user(login: $userName){
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

// Function to fetch contribution data from GitHub API
async function fetchContributions(username) {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is not set');
    process.exit(1);
  }

  const data = JSON.stringify({
    query: query,
    variables: { userName: username }
  });

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'GitHub-Profile-Generator'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.errors) {
            reject(new Error(json.errors[0].message));
          } else {
            resolve(json.data);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Function to generate SVG from contribution data
function generateSVG(contributions, isDark = false) {
  const weeks = contributions.user.contributionsCollection.contributionCalendar.weeks;
  const cellSize = 10;
  const cellGap = 3;
  const width = weeks.length * (cellSize + cellGap) + 100;
  const height = 7 * (cellSize + cellGap) + 50;

  // Color schemes
  const colorScheme = isDark ? {
    background: '#0d1117',
    text: '#c9d1d9',
    level0: '#161b22',
    level1: '#0e4429',
    level2: '#006d32',
    level3: '#26a641',
    level4: '#39d353'
  } : {
    background: '#ffffff',
    text: '#24292f',
    level0: '#ebedf0',
    level1: '#9be9a8',
    level2: '#40c463',
    level3: '#30a14e',
    level4: '#216e39'
  };

  // Calculate contribution levels
  const maxContributions = Math.max(...weeks.flatMap(week => 
    week.contributionDays.map(day => day.contributionCount)
  ));

  function getColor(count) {
    if (count === 0) return colorScheme.level0;
    const level = Math.ceil((count / maxContributions) * 4);
    return colorScheme[`level${Math.min(level, 4)}`];
  }

  // Generate SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .contribution-cell {
      stroke: ${colorScheme.background};
      stroke-width: 1;
    }
    .contribution-cell:hover {
      stroke: ${colorScheme.text};
      stroke-width: 2;
    }
    text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      font-size: 12px;
      fill: ${colorScheme.text};
    }
  </style>
  <rect width="${width}" height="${height}" fill="${colorScheme.background}"/>
  <text x="10" y="20" font-weight="bold">GitHub Contribution Graph</text>
  <g transform="translate(10, 30)">
`;

  // Draw contribution cells
  weeks.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day, dayIndex) => {
      const x = weekIndex * (cellSize + cellGap);
      const y = dayIndex * (cellSize + cellGap);
      const color = getColor(day.contributionCount);
      
      svg += `    <rect class="contribution-cell" x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" data-count="${day.contributionCount}" data-date="${day.date}">
      <title>${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''}</title>
    </rect>\n`;
    });
  });

  svg += `  </g>
</svg>`;

  return svg;
}

// Main execution
async function main() {
  try {
    console.log('Fetching contribution data from GitHub...');
    const contributions = await fetchContributions(username);
    
    const totalContributions = contributions.user.contributionsCollection.contributionCalendar.totalContributions;
    console.log(`Total contributions: ${totalContributions}`);

    // Generate light theme SVG
    console.log('Generating light theme SVG...');
    const lightSVG = generateSVG(contributions, false);
    const lightPath = path.join(outputDir, 'contribution-graph.svg');
    fs.writeFileSync(lightPath, lightSVG);
    console.log(`✓ Light theme saved to: ${lightPath}`);

    // Generate dark theme SVG
    console.log('Generating dark theme SVG...');
    const darkSVG = generateSVG(contributions, true);
    const darkPath = path.join(outputDir, 'contribution-graph-dark.svg');
    fs.writeFileSync(darkPath, darkSVG);
    console.log(`✓ Dark theme saved to: ${darkPath}`);

    console.log('\n✨ SVG generation complete!');
    console.log('\nUsage in README.md:');
    console.log(`
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${username}/${username}/output/contribution-graph-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/${username}/${username}/output/contribution-graph.svg">
  <img alt="github contribution graph" src="https://raw.githubusercontent.com/${username}/${username}/output/contribution-graph.svg">
</picture>
`);

  } catch (error) {
    console.error('Error generating SVG:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fetchContributions, generateSVG };
