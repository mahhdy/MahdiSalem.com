#!/usr/bin/env node
// Remove ALL HTML comments from a file
const fs = require('fs');
const path = require('path');

function removeAllHtmlComments(htmlContent) {
    // 1. Standard HTML comments <!-- -->
    htmlContent = htmlContent.replace(/<!--[\s\S]*?-->/g, '');

    // 2. Conditional comments <!--[if]-->
    htmlContent = htmlContent.replace(/<!-\-[^-]*?-->/gi, '');

    // 3. Script comments (// and /* */)
    htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, (match) => {
        // Remove JS comments but keep script tag structure
        let content = match.replace(/\/\/.*$/gm, '');  // Single line
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');  // Multi-line
        return content;
    });

    // 4. Style/CSS comments
    htmlContent = htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (match) => {
        return match.replace(/\/\*[\s\S]*?\*\//g, '');
    });

    // 5. Malformed comments cleanup
    htmlContent = htmlContent.replace(/<!--[^-]*?(?!-->)/g, '');

    return htmlContent;
}

// Export for use in other scripts
module.exports = { removeAllHtmlComments };

// CLI usage - only run if executed directly (not when required)
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log('Usage: node remove-html-comments.cjs <input.html> <output.html>');
        process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1];

    try {
        const htmlContent = fs.readFileSync(inputFile, 'utf8');
        const cleanHtml = removeAllHtmlComments(htmlContent);

        fs.writeFileSync(outputFile, cleanHtml, 'utf8');
        console.log(`✅ All comments removed! ${inputFile} → ${outputFile}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
