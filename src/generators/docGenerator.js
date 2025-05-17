const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { formatDocumentation } = require('../utils/formatter');

/**
 * Generate documentation using Gemini AI API
 * @param {Object} projectAnalysis - The project analysis data
 * @param {string} outputDir - Directory where documentation will be saved
 * @returns {Promise<void>}
 */
async function generateDocumentation(projectAnalysis, outputDir) {
  // Create output directory if it doesn't exist
  await fs.ensureDir(outputDir);
  
  // Prepare the prompt for Gemini API
  const prompt = prepareGeminiPrompt(projectAnalysis);
  
  // Call Gemini API to generate documentation
  const documentation = await callGeminiAPI(prompt);
    // Format the documentation
  const formattedDocumentation = formatDocumentation(documentation, projectAnalysis);
  
  // Save the generated documentation
  await saveDocumentation(formattedDocumentation, outputDir);
  
  // Generate additional documentation files
  await generateAdditionalFiles(projectAnalysis, formattedDocumentation, outputDir);
}

/**
 * Prepare a prompt for the Gemini API based on project analysis
 * @param {Object} analysis - Project analysis data
 * @returns {string} Formatted prompt for the AI
 */
function prepareGeminiPrompt(analysis) {
  // Extract key information for the prompt
  const { projectName, languages, dependencies, files } = analysis;
  
  // Format languages for the prompt
  const languagesList = Object.entries(languages)
    .map(([lang, count]) => `${lang} (${count} files)`)
    .join(', ');
  
  // Format dependencies for the prompt
  const dependenciesList = Object.keys(dependencies || {}).join(', ') || 'None detected';
  
  // Create the prompt
  return `Create comprehensive documentation for a project named "${projectName}" with the following characteristics:
  
  Project Overview:
  - Total Files: ${files}
  - Languages Used: ${languagesList}
  - Dependencies: ${dependenciesList}
  
  Please generate a complete documentation set that includes:
  1. Project Overview - Explain what this project does and its main features
  2. Installation Instructions - How to install and set up the project
  3. Usage Guide - How to use the project with examples
  4. API Documentation - Document the main functions, classes, and components
  5. Project Structure - Explain the organization of files and directories
  6. Development Guide - Instructions for developers who want to contribute
  
  Format the documentation in Markdown with proper headings, code blocks, and sections.
  
  Package.json Information:
  ${analysis.packageInfo ? JSON.stringify(analysis.packageInfo, null, 2) : 'No package.json found'}
  
  README Content:
  ${analysis.readme || 'No README found'}`;
}

/**
 * Call the Gemini API to generate documentation
 * @param {string} prompt - The formatted prompt for the AI
 * @returns {Promise<string>} The generated documentation
 */
async function callGeminiAPI(prompt) {
  try {
    // Always use the hardcoded API key first
    let apiKey = 'AIzaSyAK2OO6_nky-KR1YtHQJdFiUVjOlr6rrns';
    console.log('Using included API key');
    
    // As a backup, try to get API key from process.env
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        console.log('Using API key from environment variables');
      }
    }
    
    if (!apiKey) {
      throw new Error('API key not available. Please report this issue.');
    }
    
    console.log('Calling Gemini API...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
      // Extract the generated text from the response
    console.log('API response received.');
    
    let generatedContent;
    
    try {
      // Handle different possible response formats
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        generatedContent = response.data.candidates[0].content.parts[0].text;
      } else if (response.data?.candidates?.[0]?.content?.parts?.[0]?.textContent) {
        generatedContent = response.data.candidates[0].content.parts[0].textContent;
      } else if (response.data?.candidates?.[0]?.text) {
        generatedContent = response.data.candidates[0].text;
      } else {
        console.log('Unexpected response format:', JSON.stringify(response.data, null, 2));
        generatedContent = 'Unable to parse API response correctly. Please check the API response format.';
      }
    } catch (err) {
      console.error('Error extracting content from response:', err.message);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Failed to extract content from Gemini API response');
    }
    
    if (!generatedContent) {
      throw new Error('No content generated from Gemini API');
    }
    
    return generatedContent;
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    if (error.response) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to generate documentation: ${error.message}`);
  }
}

/**
 * Save the generated documentation to files
 * @param {string} documentation - The generated documentation content
 * @param {string} outputDir - Directory to save the documentation
 * @returns {Promise<void>}
 */
async function saveDocumentation(documentation, outputDir) {
  // Save main README.md
  await fs.writeFile(path.join(outputDir, 'README.md'), documentation);
  
  // Try to split the documentation into sections
  const sections = splitDocumentationIntoSections(documentation);
  
  // Save each section as a separate file
  for (const [title, content] of Object.entries(sections)) {
    const fileName = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '.md';
    if (fileName !== 'readme.md') { // Avoid duplicating the main README
      await fs.writeFile(path.join(outputDir, fileName), content);
    }
  }
}

/**
 * Generate additional documentation files
 * @param {Object} analysis - Project analysis data
 * @param {string} mainDoc - The main documentation content
 * @param {string} outputDir - Output directory
 * @returns {Promise<void>}
 */
async function generateAdditionalFiles(analysis, mainDoc, outputDir) {
  // Generate a summary file
  const summary = `# ${analysis.projectName} Documentation Summary

Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

## Project Statistics
- Total Files: ${analysis.files}
- Languages: ${Object.entries(analysis.languages).map(([lang, count]) => `${lang} (${count})`).join(', ')}
- Dependencies: ${Object.keys(analysis.dependencies || {}).length || 0}

## Documentation Files
${fs.readdirSync(outputDir).filter(file => file.endsWith('.md')).map(file => `- [${file}](${file})`).join('\n')}
`;
  
  await fs.writeFile(path.join(outputDir, '_SUMMARY.md'), summary);
}

/**
 * Split documentation into sections based on markdown headings
 * @param {string} documentation - Full documentation content
 * @returns {Object} Map of section title to content
 */
function splitDocumentationIntoSections(documentation) {
  const sections = {};
  const lines = documentation.split('\n');
  
  let currentSection = 'README';
  let currentContent = [];
  
  lines.forEach(line => {
    if (line.startsWith('# ')) {
      // Save the previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
      }
      
      // Start a new section
      currentSection = line.substring(2).trim();
      currentContent = [line];
    } else {
      currentContent.push(line);
    }
  });
  
  // Save the last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n');
  }
  
  return sections;
}

module.exports = {
  generateDocumentation
};
