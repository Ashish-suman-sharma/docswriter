const fs = require('fs-extra');
const path = require('path');

/**
 * Generates API documentation for a project
 * @param {Object} analysis - Project analysis data
 * @param {string} outputDir - Output directory
 * @returns {Promise<void>}
 */
async function generateApiDocs(analysis, outputDir) {
  console.log('Generating API documentation...');
  
  const apiDocs = extractApiInfo(analysis);
  
  if (Object.keys(apiDocs).length === 0) {
    console.log('No API endpoints found in the project.');
    return;
  }
  
  // Format the API documentation
  const formattedApiDocs = formatApiDocs(apiDocs);
  
  // Save to file
  const apiDocsPath = path.join(outputDir, 'api-documentation.md');
  await fs.writeFile(apiDocsPath, formattedApiDocs);
  
  console.log(`API documentation saved to ${apiDocsPath}`);
}

/**
 * Extracts API endpoint information from project files
 * @param {Object} analysis - Project analysis data
 * @returns {Object} API documentation information
 */
function extractApiInfo(analysis) {
  const apiDocs = {};
    // Find API routes in the project files
  // First, check if there's a routes folder in the structure
  let routeFiles = [];
  
  // Loop through all files
  for (const filePath in analysis.structure) {
    if (filePath.includes('routes') || filePath.includes('controller') || filePath.includes('api')) {
      // This is likely a routes file
      routeFiles.push(filePath);
    }
  }
  
  for (const file of routeFiles) {
    const content = file.content;
    
    // Look for route definitions (Express.js style)
    const routeMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
    
    if (routeMatches) {
      for (const routeMatch of routeMatches) {
        // Extract method and path
        const methodMatch = routeMatch.match(/router\.(get|post|put|delete|patch)/);
        const pathMatch = routeMatch.match(/['"`]([^'"`]+)['"`]/);
        
        if (methodMatch && pathMatch) {
          const method = methodMatch[1].toUpperCase();
          const path = pathMatch[1];
          
          // Extract comments above the route
          const routeIndex = content.indexOf(routeMatch);
          const commentBlock = extractCommentBlock(content, routeIndex);
          
          // Create or update API endpoint documentation
          const endpoint = `${method} ${path}`;
          apiDocs[endpoint] = {
            method,
            path,
            description: extractDescription(commentBlock),
            parameters: extractParameters(commentBlock),
            returns: extractReturns(commentBlock)
          };
        }
      }
    }
  }
  
  return apiDocs;
}

/**
 * Extract comment block above a route definition
 * @param {string} content - File content
 * @param {number} routeIndex - Index of route definition
 * @returns {string} Comment block
 */
function extractCommentBlock(content, routeIndex) {
  // Look for JSDoc style comments
  const commentRegex = /\/\*\*[\s\S]+?\*\//;
  const contentBeforeRoute = content.substring(0, routeIndex);
  const commentMatch = contentBeforeRoute.match(new RegExp(commentRegex.source + '\\s*$'));
  
  return commentMatch ? commentMatch[0] : '';
}

/**
 * Extract description from comment block
 * @param {string} commentBlock - JSDoc comment block
 * @returns {string} Description
 */
function extractDescription(commentBlock) {
  const descriptionMatch = commentBlock.match(/@description\s+(.+?)(?=\n\s*@|\n\s*\*\/|$)/s);
  return descriptionMatch ? descriptionMatch[1].trim() : 'No description available';
}

/**
 * Extract parameters from comment block
 * @param {string} commentBlock - JSDoc comment block
 * @returns {Array<{name: string, type: string, description: string}>} Parameters
 */
function extractParameters(commentBlock) {
  const params = [];
  const paramMatches = commentBlock.matchAll(/@param\s+\{([^}]+)\}\s+([^\s]+)\s+-\s+(.+?)(?=\n\s*@|\n\s*\*\/|$)/sg);
  
  for (const match of paramMatches) {
    params.push({
      type: match[1].trim(),
      name: match[2].trim(),
      description: match[3].trim()
    });
  }
  
  return params;
}

/**
 * Extract return value from comment block
 * @param {string} commentBlock - JSDoc comment block
 * @returns {Object} Return value info
 */
function extractReturns(commentBlock) {
  const returnsMatch = commentBlock.match(/@returns\s+\{([^}]+)\}\s+(.+?)(?=\n\s*@|\n\s*\*\/|$)/s);
  
  if (!returnsMatch) {
    return { type: 'void', description: 'No return value' };
  }
  
  return {
    type: returnsMatch[1].trim(),
    description: returnsMatch[2].trim()
  };
}

/**
 * Format API documentation as markdown
 * @param {Object} apiDocs - API documentation data
 * @returns {string} Formatted markdown
 */
function formatApiDocs(apiDocs) {
  let markdown = '# API Documentation\n\n';
  
  // Group endpoints by base path
  const groups = {};
  
  for (const [endpoint, info] of Object.entries(apiDocs)) {
    const basePath = info.path.split('/')[1] || 'root';
    
    if (!groups[basePath]) {
      groups[basePath] = [];
    }
    
    groups[basePath].push({ endpoint, info });
  }
  
  // Generate markdown for each group
  for (const [basePath, endpoints] of Object.entries(groups)) {
    markdown += `## ${basePath.toUpperCase()} Endpoints\n\n`;
    
    for (const { endpoint, info } of endpoints) {
      markdown += `### ${endpoint}\n\n`;
      markdown += `**Description:** ${info.description}\n\n`;
      
      // Parameters table
      if (info.parameters.length > 0) {
        markdown += '**Parameters:**\n\n';
        markdown += '| Name | Type | Description |\n';
        markdown += '| ---- | ---- | ----------- |\n';
        
        for (const param of info.parameters) {
          markdown += `| ${param.name} | ${param.type} | ${param.description} |\n`;
        }
        
        markdown += '\n';
      }
      
      // Return value
      markdown += `**Returns:** ${info.returns.type} - ${info.returns.description}\n\n`;
      
      // Example (placeholder)
      markdown += '**Example Request:**\n\n';
      markdown += '```javascript\n';
      markdown += `// Example ${info.method} request to ${info.path}\n`;
      markdown += '```\n\n';
      
      markdown += '**Example Response:**\n\n';
      markdown += '```json\n';
      markdown += '// Example response\n';
      markdown += '```\n\n';
      
      markdown += '---\n\n';
    }
  }
  
  return markdown;
}

module.exports = {
  generateApiDocs
};
