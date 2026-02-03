#!/usr/bin/env node
/**
 * Icon Generation CLI for website metadata.
 *
 * Commands:
 *   yarn icons generate     - Generate all icons from source files
 *   yarn icons audit        - Audit existing icons and show missing
 *   yarn icons help         - Show usage information
 *
 * Required input files (in public/sources/):
 *   - icon-512.png          - Opaque background, logo within 80% safe zone, for all app icons
 *   - favicon.png           - Transparent background, for ICO generation
 *   - favicon.svg           - Base SVG (will inject dark mode CSS)
 *
 * Options:
 *   --light-color "#000000" - Color for browser light theme (SVG)
 *   --dark-color "#ffffff"  - Color for browser dark theme (SVG)
 *   --skip-maskable         - Don't generate maskable icon
 *   --skip-ico              - Don't generate ICO file
 *   --skip-svg              - Don't process SVG file
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';

// Paths
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SOURCES_DIR = path.join(PUBLIC_DIR, 'sources');

// Source files
const SOURCE_512 = path.join(SOURCES_DIR, 'icon-512.png');
const SOURCE_FAVICON = path.join(SOURCES_DIR, 'favicon.png');
const SOURCE_SVG = path.join(SOURCES_DIR, 'favicon.svg');

// Output files - all in public/ root for simplicity
const OUTPUT_FILES = {
  // From icon-512.png (opaque, with safe zone padding for maskable compatibility)
  'icon-512.png': { size: 512, source: 'opaque' },
  'icon-512-maskable.png': { size: 512, source: 'opaque' },
  'icon-192.png': { size: 192, source: 'opaque' },
  'icon-144.png': { size: 144, source: 'opaque' },
  'icon-96.png': { size: 96, source: 'opaque' },
  'icon-72.png': { size: 72, source: 'opaque' },
  'apple-touch-icon.png': { size: 180, source: 'opaque' },

  // From favicon.png (transparent)
  'favicon.ico': { sizes: [16, 32, 48], source: 'transparent' },

  // From favicon.svg
  'favicon.svg': { source: 'svg' },
} as const;

interface GenerateOptions {
  lightColor: string;
  darkColor: string;
  skipMaskable: boolean;
  skipIco: boolean;
  skipSvg: boolean;
  dryRun: boolean;
}

interface AuditResult {
  sources: {
    name: string;
    path: string;
    exists: boolean;
    required: boolean;
  }[];
  outputs: {
    name: string;
    path: string;
    exists: boolean;
    status: 'ok' | 'missing' | 'outdated';
  }[];
}

/**
 * Check if sharp is available
 */
async function checkSharpAvailable(): Promise<boolean> {
  try {
    await import('sharp');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if png-to-ico is available
 */
async function checkPngToIcoAvailable(): Promise<boolean> {
  try {
    await import('png-to-ico');
    return true;
  } catch {
    return false;
  }
}

/**
 * Audit source and output files
 */
function auditFiles(): AuditResult {
  const sources = [
    {
      name: 'icon-512.png',
      path: SOURCE_512,
      exists: fs.existsSync(SOURCE_512),
      required: true,
    },
    {
      name: 'favicon.png',
      path: SOURCE_FAVICON,
      exists: fs.existsSync(SOURCE_FAVICON),
      required: true,
    },
    {
      name: 'favicon.svg',
      path: SOURCE_SVG,
      exists: fs.existsSync(SOURCE_SVG),
      required: true,
    },
  ];

  const outputs = Object.entries(OUTPUT_FILES).map(([name]) => {
    const outputPath = path.join(PUBLIC_DIR, name);
    const exists = fs.existsSync(outputPath);
    return {
      name,
      path: outputPath,
      exists,
      status: exists ? ('ok' as const) : ('missing' as const),
    };
  });

  return { sources, outputs };
}

/**
 * Resize PNG using sharp
 */
async function resizePng(
  inputPath: string,
  outputPath: string,
  size: number,
  options?: { padding?: number; backgroundColor?: string }
): Promise<void> {
  const sharp = (await import('sharp')).default;

  let pipeline = sharp(inputPath);

  if (options?.padding) {
    // For maskable icons, add padding by resizing smaller then extending
    const innerSize = Math.round(size * (1 - options.padding * 2));
    pipeline = pipeline.resize(innerSize, innerSize, { fit: 'contain' });

    // Extend with background color to add padding
    const paddingPx = Math.round(size * options.padding);
    pipeline = pipeline.extend({
      top: paddingPx,
      bottom: paddingPx,
      left: paddingPx,
      right: paddingPx,
      background: options.backgroundColor || { r: 255, g: 255, b: 255, alpha: 1 },
    });
  } else {
    pipeline = pipeline.resize(size, size, { fit: 'contain' });
  }

  await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
}

/**
 * Generate ICO from PNG
 */
async function generateIco(inputPath: string, outputPath: string, sizes: number[]): Promise<void> {
  const sharp = (await import('sharp')).default;
  const pngToIco = (await import('png-to-ico')).default;

  // Create temporary resized PNGs
  const tempDir = path.join(process.cwd(), '.temp-icons');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFiles: string[] = [];

  try {
    // Resize to each required size
    for (const size of sizes) {
      const tempPath = path.join(tempDir, `icon-${size}.png`);
      await sharp(inputPath).resize(size, size, { fit: 'contain' }).png().toFile(tempPath);
      tempFiles.push(tempPath);
    }

    // Combine into ICO
    const icoBuffer = await pngToIco(tempFiles);
    fs.writeFileSync(outputPath, icoBuffer);
  } finally {
    // Cleanup temp files
    for (const tempFile of tempFiles) {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }
  }
}

/**
 * Process SVG to add dark mode support
 */
function processSvg(inputPath: string, outputPath: string, lightColor: string, darkColor: string): void {
  let svg = fs.readFileSync(inputPath, 'utf-8');

  // Check if SVG already has a style tag with prefers-color-scheme
  if (svg.includes('prefers-color-scheme')) {
    // Already processed, just copy
    fs.writeFileSync(outputPath, svg);
    return;
  }

  // Find all fill attributes and replace with CSS class
  // This is a simple approach - works for single-color SVGs
  const fillRegex = /fill=["']([^"']+)["']/g;
  const strokeRegex = /stroke=["']([^"']+)["']/g;

  // Check if there are fills/strokes to replace
  const hasFill = fillRegex.test(svg);
  const hasStroke = strokeRegex.test(svg);

  if (!hasFill && !hasStroke) {
    // No fill or stroke, add fill to all paths/shapes
    svg = svg.replace(/<(path|circle|rect|polygon|ellipse|line)([^>]*)\/?>/g, (match, tag, attrs) => {
      if (!attrs.includes('fill=') && !attrs.includes('class=')) {
        return `<${tag}${attrs} class="icon-color"/>`;
      }
      return match;
    });
  } else {
    // Replace fill/stroke with class
    svg = svg.replace(fillRegex, 'class="icon-color"');
  }

  // Create the style block
  const styleBlock = `
  <style>
    .icon-color { fill: ${lightColor}; }
    @media (prefers-color-scheme: dark) {
      .icon-color { fill: ${darkColor}; }
    }
  </style>`;

  // Insert style after opening svg tag
  svg = svg.replace(/<svg([^>]*)>/, `<svg$1>${styleBlock}`);

  fs.writeFileSync(outputPath, svg);
}

/**
 * Generate all icons
 */
async function generateIcons(options: GenerateOptions): Promise<void> {
  const spinner = ora();

  // Check dependencies
  spinner.start('Checking dependencies...');

  const hasSharp = await checkSharpAvailable();
  const hasPngToIco = await checkPngToIcoAvailable();

  if (!hasSharp) {
    spinner.fail('sharp is not installed');
    console.log(chalk.yellow('\nInstall sharp to enable PNG processing:'));
    console.log(chalk.cyan('  yarn add -D sharp\n'));

    if (!options.skipIco && !options.skipMaskable) {
      process.exit(1);
    }
  }

  if (!hasPngToIco && !options.skipIco) {
    spinner.fail('png-to-ico is not installed');
    console.log(chalk.yellow('\nInstall png-to-ico to enable ICO generation:'));
    console.log(chalk.cyan('  yarn add -D png-to-ico\n'));

    if (!options.skipIco) {
      console.log(chalk.gray('Or use --skip-ico to skip ICO generation\n'));
      process.exit(1);
    }
  }

  spinner.succeed('Dependencies available');

  // Check source files
  spinner.start('Checking source files...');

  const audit = auditFiles();
  const missingSources = audit.sources.filter((s) => s.required && !s.exists);

  if (missingSources.length > 0) {
    spinner.fail('Missing source files');
    console.log(chalk.red('\nMissing required source files:\n'));
    for (const source of missingSources) {
      console.log(chalk.red(`  ✗ ${source.name}`));
      console.log(chalk.gray(`    Expected at: ${source.path}\n`));
    }
    console.log(chalk.yellow('Create these files in public/sources/ before running generate.\n'));
    process.exit(1);
  }

  spinner.succeed('Source files found');

  if (options.dryRun) {
    console.log(chalk.yellow('\n🔍 Dry run - showing what would be generated:\n'));
  }

  // Ensure sources directory exists
  if (!fs.existsSync(SOURCES_DIR) && !options.dryRun) {
    fs.mkdirSync(SOURCES_DIR, { recursive: true });
  }

  let generated = 0;
  let skipped = 0;

  // Generate PNG icons from icon-512.png source
  console.log(chalk.blue('\n📱 Generating mobile/PWA icons...\n'));

  for (const [filename, config] of Object.entries(OUTPUT_FILES)) {
    if (config.source === 'opaque') {
      const outputPath = path.join(PUBLIC_DIR, filename);

      if (options.dryRun) {
        console.log(chalk.cyan(`  → ${filename} (${config.size}x${config.size})`));
        generated++;
        continue;
      }

      spinner.start(`Generating ${filename}...`);

      try {
        await resizePng(SOURCE_512, outputPath, config.size);
        spinner.succeed(`${filename} (${config.size}x${config.size})`);
        generated++;
      } catch (error) {
        spinner.fail(`Failed to generate ${filename}`);
        console.log(chalk.red(`  Error: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
  }

  // Generate ICO from transparent source
  if (!options.skipIco) {
    console.log(chalk.blue('\n🖼️  Generating favicon.ico...\n'));

    const icoConfig = OUTPUT_FILES['favicon.ico'];
    const outputPath = path.join(PUBLIC_DIR, 'favicon.ico');

    if (options.dryRun) {
      console.log(chalk.cyan(`  → favicon.ico (${icoConfig.sizes.join(', ')}px)`));
      generated++;
    } else {
      spinner.start('Generating favicon.ico...');

      try {
        await generateIco(SOURCE_FAVICON, outputPath, [...icoConfig.sizes]);
        spinner.succeed(`favicon.ico (${icoConfig.sizes.join(', ')}px)`);
        generated++;
      } catch (error) {
        spinner.fail('Failed to generate favicon.ico');
        console.log(chalk.red(`  Error: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
  } else {
    console.log(chalk.gray('\n  ⊘ favicon.ico (skipped)\n'));
    skipped++;
  }

  // Process SVG
  if (!options.skipSvg) {
    console.log(chalk.blue('\n🎨 Processing favicon.svg...\n'));

    const outputPath = path.join(PUBLIC_DIR, 'favicon.svg');

    if (options.dryRun) {
      console.log(chalk.cyan(`  → favicon.svg (light: ${options.lightColor}, dark: ${options.darkColor})`));
      generated++;
    } else {
      spinner.start('Processing favicon.svg...');

      try {
        processSvg(SOURCE_SVG, outputPath, options.lightColor, options.darkColor);
        spinner.succeed(`favicon.svg (light: ${options.lightColor}, dark: ${options.darkColor})`);
        generated++;
      } catch (error) {
        spinner.fail('Failed to process favicon.svg');
        console.log(chalk.red(`  Error: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
  } else {
    console.log(chalk.gray('\n  ⊘ favicon.svg (skipped)\n'));
    skipped++;
  }

  // Summary
  console.log(chalk.green('\n✅ Icon generation complete!\n'));
  console.log(`  Generated: ${chalk.green(generated)} files`);
  if (skipped > 0) {
    console.log(`  Skipped: ${chalk.yellow(skipped)} files`);
  }

  if (options.dryRun) {
    console.log(chalk.gray('\nRun without --dry-run to generate files.\n'));
  }
}

/**
 * Display audit results
 */
function displayAudit(): void {
  const audit = auditFiles();

  console.log(chalk.blue('\n📋 Icon Audit\n'));

  // Source files
  console.log(chalk.yellow('Source Files (public/sources/):\n'));

  for (const source of audit.sources) {
    const status = source.exists ? chalk.green('✓') : chalk.red('✗');
    const label = source.required ? '' : chalk.gray(' (optional)');
    console.log(`  ${status} ${source.name}${label}`);
  }

  // Output files
  console.log(chalk.yellow('\nOutput Files (public/):\n'));

  for (const output of audit.outputs) {
    const status = output.exists ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${status} ${output.name}`);
  }

  // Summary
  const missingOutputs = audit.outputs.filter((o) => !o.exists);
  const missingSources = audit.sources.filter((s) => s.required && !s.exists);

  console.log('');

  if (missingSources.length > 0) {
    console.log(chalk.red(`⚠️  ${missingSources.length} source file(s) missing\n`));
    console.log(chalk.yellow('Create these files before running generate:\n'));
    for (const source of missingSources) {
      console.log(chalk.gray(`  ${source.path}`));
    }
    console.log('');
  }

  if (missingOutputs.length > 0 && missingSources.length === 0) {
    console.log(chalk.yellow(`${missingOutputs.length} output file(s) missing\n`));
    console.log('Run to generate:\n');
    console.log(chalk.cyan('  yarn icons generate\n'));
  } else if (missingOutputs.length === 0) {
    console.log(chalk.green('✅ All icons present!\n'));
  }
}

// CLI program
const program = new Command();

program
  .name('icons')
  .description('Icon generation for website metadata (favicons, PWA icons, etc.)')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate all icons from source files')
  .option('--light-color <color>', 'SVG color for light theme', '#000000')
  .option('--dark-color <color>', 'SVG color for dark theme', '#ffffff')
  .option('--skip-maskable', 'Skip maskable icon generation', false)
  .option('--skip-ico', 'Skip ICO file generation', false)
  .option('--skip-svg', 'Skip SVG processing', false)
  .option('--dry-run', 'Preview without generating files', false)
  .action(async (options: GenerateOptions) => {
    try {
      await generateIcons(options);
    } catch (error) {
      console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
      process.exit(1);
    }
  });

program
  .command('audit')
  .description('Audit existing icons and show what is missing')
  .action(() => {
    displayAudit();
  });

program
  .command('help')
  .description('Show detailed usage information')
  .action(() => {
    console.log(chalk.blue('\n📦 Icon Generation Tool\n'));
    console.log('This tool generates all required website icons from source files.\n');

    console.log(chalk.yellow('Source Files Required:\n'));
    console.log('  Place these files in public/sources/\n');
    console.log('  1. icon-512.png');
    console.log('     - Size: 512x512 pixels');
    console.log('     - Background: Opaque (solid color)');
    console.log('     - Logo within center 80% (409x409 safe zone)');
    console.log('     - Used for: All app icons (iOS, Android, PWA)\n');
    console.log('  2. favicon.png');
    console.log('     - Size: 48x48 pixels (or larger)');
    console.log('     - Background: Transparent');
    console.log('     - Used for: favicon.ico (browser tabs)\n');
    console.log('  3. favicon.svg');
    console.log('     - Format: SVG');
    console.log('     - Single color (will be modified for dark mode)');
    console.log('     - Used for: favicon.svg with dark mode support\n');

    console.log(chalk.yellow('Generated Files:\n'));
    console.log('  From icon-512.png:');
    console.log('    • icon-512.png (512x512)');
    console.log('    • icon-512-maskable.png (512x512)');
    console.log('    • icon-192.png (192x192)');
    console.log('    • icon-144.png (144x144)');
    console.log('    • icon-96.png (96x96)');
    console.log('    • icon-72.png (72x72)');
    console.log('    • apple-touch-icon.png (180x180)\n');
    console.log('  From favicon.png:');
    console.log('    • favicon.ico (16, 32, 48px multi-resolution)\n');
    console.log('  From favicon.svg:');
    console.log('    • favicon.svg (with dark mode CSS injected)\n');

    console.log(chalk.yellow('Commands:\n'));
    console.log('  yarn icons audit      Check what files exist/missing');
    console.log('  yarn icons generate   Generate all icons');
    console.log('  yarn icons help       Show this help\n');

    console.log(chalk.yellow('Options:\n'));
    console.log('  --light-color "#000"  SVG fill color for light theme');
    console.log('  --dark-color "#fff"   SVG fill color for dark theme');
    console.log('  --skip-maskable       Skip maskable icon');
    console.log('  --skip-ico            Skip ICO generation');
    console.log('  --skip-svg            Skip SVG processing');
    console.log('  --dry-run             Preview without changes\n');

    console.log(chalk.yellow('Example:\n'));
    console.log(chalk.cyan('  yarn icons generate --light-color "#1a1a1a" --dark-color "#e5e5e5"\n'));
  });

program.parse();
