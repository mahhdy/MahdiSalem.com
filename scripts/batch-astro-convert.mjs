#!/usr/bin/env node
/**
 * Batch Content Processing Script with Astro MDX Enhancement
 * 
 * استفاده:
 *   node scripts/batch-astro-convert.mjs --all           (همه فایل‌ها)
 *   node scripts/batch-astro-convert.mjs --dir articles  (دایرکتوری خاص)
 *   node scripts/batch-astro-convert.mjs --file path     (فایل خاص)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';
import matter from 'gray-matter';
import { AstroPipelineAdapter } from './lib/astro-pipeline-adapter.mjs';
import { AstroMDXConverter } from './lib/astro-mdx-converter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===================================================================
// Configuration
// ===================================================================

const CONFIG = {
    sourceDir: path.join(__dirname, '../content-source'),
    outputDir: path.join(__dirname, '../src/content'),
    articlesDir: 'articles',
    booksDir: 'books',
    supportedExts: ['.md', '.mdx', '.MD', '.MDX']
};

// ===================================================================
// Helper Functions
// ===================================================================

async function findFiles(pattern) {
    try {
        return await globby(pattern);
    } catch (error) {
        console.error(`❌ Error finding files: ${error.message}`);
        return [];
    }
}

function detectLanguage(filePath) {
    return (filePath.includes('/en/') || filePath.includes('\\en\\')) ? 'en' : 'fa';
}

function createOutputPath(sourceFile, outputDir) {
    const ext = path.extname(sourceFile);
    const baseName = path.basename(sourceFile, ext);
    
    // Always use .mdx for Astro
    const outputFile = `${baseName}.mdx`;
    return path.join(outputDir, outputFile);
}

async function ensureOutputDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

// ===================================================================
// Processing Functions
// ===================================================================

async function processArticle(filePath, adapter) {
    const lang = detectLanguage(filePath);
    const outputDir = path.join(
        CONFIG.outputDir,
        'articles',
        lang
    );

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content: body } = matter(content);

        // Create pipeline result
        const pipelineResult = {
            type: 'markdown',
            source: filePath,
            title: frontmatter.title || filePath,
            content: body,
            frontmatter: frontmatter,
            metadata: { lang }
        };

        // Enhance with Astro
        const enhanced = await adapter.enhance(pipelineResult, {
            sourceFile: filePath,
            lang: lang
        });

        // Save
        await ensureOutputDir(outputDir);
        const outputPath = createOutputPath(filePath, outputDir);
        
        const mdxContent = enhanced.content;
        await fs.writeFile(outputPath, mdxContent, 'utf-8');

        console.log(`   ✅ ${path.basename(outputPath)}`);
        return { success: true, file: outputPath };

    } catch (error) {
        console.error(`   ❌ ${path.basename(filePath)}: ${error.message}`);
        return { success: false, file: filePath, error: error.message };
    }
}

async function processDirectory(sourcePattern, adapter, description) {
    console.log(`\n📁 ${description}`);
    console.log('─'.repeat(60));

    const files = await findFiles(sourcePattern);
    
    if (files.length === 0) {
        console.log('   (no files found)');
        return [];
    }

    const results = [];
    for (const file of files) {
        const result = await processArticle(file, adapter);
        results.push(result);
    }

    return results;
}

async function processAllContent(adapter) {
    console.log('\n🚀 Starting Batch Astro Content Processing\n');
    console.log('═'.repeat(60));

    const allResults = [];

    // Process articles
    const articlePattern = path.join(
        CONFIG.sourceDir,
        CONFIG.articlesDir,
        '**/*.{md,mdx}'
    );
    const articleResults = await processDirectory(
        articlePattern,
        adapter,
        'Processing Articles'
    );
    allResults.push(...articleResults);

    // Process books (if they exist as .md files)
    const bookPattern = path.join(
        CONFIG.sourceDir,
        CONFIG.booksDir,
        '**/*.{md,mdx}'
    );
    const bookResults = await processDirectory(
        bookPattern,
        adapter,
        'Processing Books'
    );
    allResults.push(...bookResults);

    return allResults;
}

async function processSpecificFile(filePath, adapter) {
    console.log('\n🎯 Processing Single File\n');
    console.log('═'.repeat(60));

    const absolutePath = path.resolve(filePath);

    // Check if file exists
    try {
        await fs.access(absolutePath);
    } catch {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
    }

    const result = await processArticle(absolutePath, adapter);
    return [result];
}

async function processDirectory(dirPath, adapter) {
    console.log(`\n📁 Processing Directory: ${dirPath}`);
    console.log('─'.repeat(60));

    const pattern = path.join(dirPath, '**/*.{md,mdx}');
    const files = await findFiles(pattern);

    if (files.length === 0) {
        console.log('   (no Markdown files found)');
        return [];
    }

    const results = [];
    for (const file of files) {
        const result = await processArticle(file, adapter);
        results.push(result);
    }

    return results;
}

// ===================================================================
// Report Generation
// ===================================================================

function printReport(results, stats) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('📊 Processing Report');
    console.log('═'.repeat(60));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Total: ${results.length}`);

    console.log(`\n🔄 Converter Stats:`);
    console.log(`   Enhanced: ${stats.enhanced}`);
    console.log(`   Validated: ${stats.validated}`);
    console.log(`   Warnings: ${stats.warnings.length}`);
    console.log(`   Errors: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
        console.log(`\n⚠️ Errors:`);
        stats.errors.forEach(err => {
            console.log(`   - ${err.file}: ${err.error}`);
        });
    }

    console.log(`\n${'═'.repeat(60)}`);
}

// ===================================================================
// Main Entry Point
// ===================================================================

async function main() {
    const args = process.argv.slice(2);
    const adapter = new AstroPipelineAdapter({
        strict: false,
        autoFixFrontmatter: true
    });

    let results = [];

    try {
        if (args.includes('--all')) {
            results = await processAllContent(adapter);
        } else if (args.includes('--dir')) {
            const dirIndex = args.indexOf('--dir');
            const dirPath = args[dirIndex + 1];
            if (!dirPath) {
                console.error('❌ Directory path required for --dir');
                process.exit(1);
            }
            results = await processDirectory(dirPath, adapter);
        } else if (args.includes('--file')) {
            const fileIndex = args.indexOf('--file');
            const filePath = args[fileIndex + 1];
            if (!filePath) {
                console.error('❌ File path required for --file');
                process.exit(1);
            }
            results = await processSpecificFile(filePath, adapter);
        } else {
            console.log(`\n📚 Batch Astro Content Converter`);
            console.log('═'.repeat(60));
            console.log('\nUsage:');
            console.log('  node scripts/batch-astro-convert.mjs --all');
            console.log('  node scripts/batch-astro-convert.mjs --dir <pattern>');
            console.log('  node scripts/batch-astro-convert.mjs --file <path>');
            console.log('\nExamples:');
            console.log('  node scripts/batch-astro-convert.mjs --all');
            console.log('  node scripts/batch-astro-convert.mjs --dir content-source/articles/fa');
            console.log('  node scripts/batch-astro-convert.mjs --file content-source/articles/fa/test.md');
            process.exit(0);
        }

        const stats = adapter.getStats();
        printReport(results, stats);

        const failureCount = results.filter(r => !r.success).length;
        process.exit(failureCount > 0 ? 1 : 0);

    } catch (error) {
        console.error(`\n❌ Fatal Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
