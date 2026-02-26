#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command()
  .name('svgpng')
  .description('Batch convert SVG to PNG with optional size/DPI. Preserves original size if none specified.')
  .argument('<inputDir>', 'Path to folder containing SVG files')
  .option('-w, --width <value>', 'Target width in pixels (e.g. 1000)', parseInt)
  .option('-h, --height <value>', 'Target height in pixels (e.g. 1000)', parseInt)
  .option('-d, --dpi <value>', 'Render DPI (default: 72)', 72, parseInt)
  .option('-o, --output <dir>', 'Output folder (default: inputDir/pngs)', 'pngs')
  .action(async (inputDir, options) => {
    try {
      const absInput = path.resolve(inputDir);
      const absOutput = path.resolve(path.join(absInput, options.output));

      await fs.mkdir(absOutput, { recursive: true });

      const files = await fs.readdir(absInput);
      const svgs = files.filter(f => f.toLowerCase().endsWith('.svg'));

      if (svgs.length === 0) {
        console.log(chalk.yellow('No SVG files found in'), absInput);
        return;
      }

      console.log(chalk.green(`Converting ${svgs.length} SVGs...`));
      console.log(chalk.gray(`DPI: ${options.dpi}`));
      if (options.width || options.height) {
        console.log(chalk.gray(`Size: ${options.width || '?'}x${options.height || '?'}`));
      }

      let processed = 0;
      for (const file of svgs) {
        const inputPath = path.join(absInput, file);
        const outputFile = path.basename(file, '.svg').toLowerCase() + '.png';
        const outputPath = path.join(absOutput, outputFile);

        const sharpImg = sharp(inputPath, { density: options.dpi });

        if (options.width && options.height) {
          sharpImg.resize(options.width, options.height, { fit: 'inside' });
        } else if (options.width) {
          sharpImg.resize(options.width);
        } else if (options.height) {
          sharpImg.resize(undefined, options.height);
        }

        await sharpImg.png({ quality: 95 }).toFile(outputPath);
        processed++;
        console.log(chalk.green(`✓ ${file} → ${outputFile}`));
      }

      console.log(chalk.green(`\nDone! ${processed} PNGs in ${absOutput}`));
    } catch (err) {
      console.error(chalk.red('Error:'), err.message);
      process.exit(1);
    }
  });

await program.parseAsync();
