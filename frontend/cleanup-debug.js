#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File to clean up
const filePath = path.join(__dirname, 'src', 'App.js');

function cleanupDebugCode() {
  try {
    console.log('🧹 Cleaning up debug code in App.js...');
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Track changes
    let changeCount = 0;
    
    // Remove or replace console statements
    const replacements = [
      // Remove simple console.log statements
      {
        pattern: /console\.log\([^)]*\);?\n?/g,
        replacement: '',
        description: 'Removed console.log statements'
      },
      
      // Replace console.error with logger.error (keep important ones)
      {
        pattern: /console\.error\(/g,
        replacement: 'logger.error(',
        description: 'Replaced console.error with logger.error'
      },
      
      // Replace console.warn with logger.warn
      {
        pattern: /console\.warn\(/g,
        replacement: 'logger.warn(',
        description: 'Replaced console.warn with logger.warn'
      },
      
      // Remove debug-specific console statements with emojis
      {
        pattern: /console\.log\(['"][^'"]*[🔍💼🚀✅🎯🧭🔄❌💥📝][^'"]*['"][^)]*\);?\n?/g,
        replacement: '',
        description: 'Removed emoji debug statements'
      }
    ];
    
    // Apply replacements
    replacements.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        changeCount += matches.length;
        console.log(`  ✅ ${description}: ${matches.length} instances`);
        content = content.replace(pattern, replacement);
      }
    });
    
    // Add logger import at the top if we replaced any console.error/warn
    if (content.includes('logger.error') || content.includes('logger.warn')) {
      if (!content.includes('import { logger }')) {
        const importStatement = "import { logger } from './utils/cleanup';\n";
        content = content.replace(
          /(import.*from.*['"][^'"]*['"];\n)/,
          `$1${importStatement}`
        );
        console.log('  ✅ Added logger import');
        changeCount++;
      }
    }
    
    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n🎉 Debug cleanup completed!`);
    console.log(`   Total changes: ${changeCount}`);
    console.log(`   File: ${filePath}`);
    
    return changeCount;
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    return 0;
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupDebugCode();
}

module.exports = { cleanupDebugCode };