#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DEFAULT_TEMPLATE_PATH = path.join(ROOT, 'brands', 'richesse-club', 'body.template.json');
const DEFAULT_DATA_FILE = 'slides.data.json';

main();

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.project && !args.input) {
    printUsage();
    process.exit(1);
  }

  const resolved = resolvePaths(args);
  const template = readJson(resolved.templatePath);
  const templateSlide = Array.isArray(template.slides) && template.slides.length > 0
    ? template.slides[0]
    : null;

  if (!templateSlide || typeof templateSlide.css !== 'string') {
    fail(`Template slide not found in ${resolved.templatePath}`);
  }

  const data = readJson(resolved.dataPath);
  validateDataFile(data, resolved.dataPath);

  const meta = buildMeta(data.meta);
  const coverSlides = loadCoverSlides(resolved.coverPath, resolved.outputPath);
  const bodySlides = data.slides.map((slide, index) => buildSlide(templateSlide, slide, coverSlides.length + index + 1));
  const slides = [...coverSlides, ...bodySlides];
  const output = {
    meta,
    slides,
  };

  writeJson(resolved.outputPath, output);
  console.log(`[Richesse Builder] Wrote ${slides.length} slide(s) to ${resolved.outputPath}`);
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === '--project') {
      args.project = next;
      i += 1;
      continue;
    }

    if (token === '--input') {
      args.input = next;
      i += 1;
      continue;
    }

    if (token === '--output') {
      args.output = next;
      i += 1;
      continue;
    }

    if (token === '--template') {
      args.template = next;
      i += 1;
      continue;
    }

    if (token === '--cover') {
      args.cover = next;
      i += 1;
      continue;
    }

    if (token === '--help' || token === '-h') {
      printUsage();
      process.exit(0);
    }

    fail(`Unknown argument: ${token}`);
  }

  return args;
}

function resolvePaths(args) {
  const templatePath = args.template
    ? path.resolve(ROOT, args.template)
    : DEFAULT_TEMPLATE_PATH;

  if (args.project) {
    const projectDir = path.resolve(ROOT, args.project);
    const projectJsonPath = path.join(projectDir, 'project.json');
    const project = fileExists(projectJsonPath) ? readJson(projectJsonPath) : null;
    const paths = project && project.paths ? project.paths : {};

    if (project && project.brand && project.brand !== 'richesse-club') {
      fail(`Project brand must be richesse-club: ${project.brand}`);
    }

    return {
      templatePath,
      dataPath: args.input
        ? path.resolve(ROOT, args.input)
        : path.join(projectDir, paths.templateData || DEFAULT_DATA_FILE),
      coverPath: args.cover
        ? path.resolve(ROOT, args.cover)
        : (paths.coverSlide ? path.join(projectDir, paths.coverSlide) : null),
      outputPath: args.output
        ? path.resolve(ROOT, args.output)
        : path.join(projectDir, paths.carouselJson || 'carousel.json'),
    };
  }

  const dataPath = path.resolve(ROOT, args.input);
  return {
    templatePath,
    dataPath,
    coverPath: args.cover ? path.resolve(ROOT, args.cover) : null,
    outputPath: args.output
      ? path.resolve(ROOT, args.output)
      : path.join(path.dirname(dataPath), 'carousel.json'),
  };
}

function buildMeta(meta) {
  return {
    brand: meta && typeof meta.brand === 'string' ? meta.brand : 'richesse.club',
    width: Number(meta && meta.width) || 1080,
    height: Number(meta && meta.height) || 1440,
  };
}

function buildSlide(templateSlide, slide, visualIndex) {
  validateSlide(slide, visualIndex);

  const titleHtml = slide.titleLines
    .map((line) => `<span>${escapeHtml(line)}</span>`)
    .join('');

  const leadHtml = slide.leadLines
    .map((line) => escapeHtml(line))
    .join('<br />');

  const quoteHtml = slide.quoteLines
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');

  return {
    theme: templateSlide.theme || 'dark',
    chrome: templateSlide.chrome || 'none',
    footer: templateSlide.footer || 'none',
    html: `<section class='rb'><div class='rb__meta'><span class='rb__index'>[${formatIndex(visualIndex)}]</span><span class='rb__rule'></span></div><h2 class='rb__title'>${titleHtml}</h2><div class='rb__copy'><p class='rb__body rb__body--lead'>${leadHtml}</p><p class='rb__body'>${escapeHtml(slide.secondary)}</p><div class='rb__quote'>${quoteHtml}</div><p class='rb__bullet'>• ${escapeHtml(slide.bullet)}</p></div><div class='rb__source'><span class='rb__source-tag'>[ ${escapeHtml(slide.sourceLeft)} ]</span><span class='rb__source-tag rb__source-tag--right'>[ ${escapeHtml(slide.sourceRight)} ]</span></div></section>`,
    css: templateSlide.css,
  };
}

function loadCoverSlides(coverPath, outputPath) {
  const explicitCoverPath = coverPath && fileExists(coverPath)
    ? coverPath
    : null;
  const fallbackCoverPath = !explicitCoverPath && outputPath && fileExists(outputPath)
    ? outputPath
    : null;

  if (!explicitCoverPath && !fallbackCoverPath) {
    return [];
  }

  const sourcePath = explicitCoverPath || fallbackCoverPath;
  const coverData = readJson(sourcePath);

  if (Array.isArray(coverData)) {
    return coverData;
  }

  if (Array.isArray(coverData.slides)) {
    return coverData.slides.slice(0, 1);
  }

  if (coverData && typeof coverData === 'object' && typeof coverData.html === 'string') {
    return [coverData];
  }

  fail(`cover slide file must be a slide object, slide array, or carousel object: ${sourcePath}`);
}

function validateDataFile(data, dataPath) {
  if (!data || typeof data !== 'object') {
    fail(`Invalid data file: ${dataPath}`);
  }

  if (!Array.isArray(data.slides) || data.slides.length === 0) {
    fail(`slides must be a non-empty array in ${dataPath}`);
  }
}

function validateSlide(slide, slideNumber) {
  assertStringArray(slide.titleLines, `slides[${slideNumber - 1}].titleLines`, 2, 2);
  assertStringArray(slide.leadLines, `slides[${slideNumber - 1}].leadLines`, 1);
  assertString(slide.secondary, `slides[${slideNumber - 1}].secondary`);
  assertStringArray(slide.quoteLines, `slides[${slideNumber - 1}].quoteLines`, 1);
  assertString(slide.bullet, `slides[${slideNumber - 1}].bullet`);
  assertString(slide.sourceLeft, `slides[${slideNumber - 1}].sourceLeft`);
  assertString(slide.sourceRight, `slides[${slideNumber - 1}].sourceRight`);
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${label} must be a non-empty string`);
  }
}

function assertStringArray(value, label, minLength, maxLength) {
  if (!Array.isArray(value) || value.length < minLength) {
    fail(`${label} must contain at least ${minLength} item(s)`);
  }

  if (maxLength != null && value.length > maxLength) {
    fail(`${label} must contain at most ${maxLength} item(s)`);
  }

  value.forEach((item, index) => {
    assertString(item, `${label}[${index}]`);
  });
}

function formatIndex(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return String(numeric).padStart(2, '0');
  }

  return value.trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Failed to read JSON from ${filePath}: ${error.message}`);
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function printUsage() {
  console.log('Usage: node scripts/build-richesse-carousel.js --project <project-dir> [--template <carousel-template>] [--cover <cover-slide.json>]');
  console.log('   or: node scripts/build-richesse-carousel.js --input <slides.data.json> [--output <carousel.json>] [--template <carousel-template>] [--cover <cover-slide.json>]');
}

function fail(message) {
  console.error(`[Richesse Builder] ${message}`);
  process.exit(1);
}
