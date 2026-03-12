const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
let dataPath = '';
let outDir = '';
let skipBuild = false;
let forceBuild = false;
let mode = 'final';
let screenshotType = 'png';
let jpegQuality = 90;
const DEFAULT_SLIDE_WIDTH = 1080;
const DEFAULT_SLIDE_HEIGHT = 1440;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--data') dataPath = args[i + 1];
  if (args[i] === '--output') outDir = args[i + 1];
  if (args[i] === '--skip-build') skipBuild = true;
  if (args[i] === '--force-build') forceBuild = true;
  if (args[i] === '--preview') mode = 'preview';
  if (args[i] === '--mode') mode = args[i + 1];
  if (args[i] === '--format') screenshotType = args[i + 1];
  if (args[i] === '--jpeg-quality') jpegQuality = Number(args[i + 1]);
}

if (!dataPath || !outDir) {
  console.error('Usage: node render.js --data <path-to-json> --output <dir> [--preview] [--skip-build] [--force-build] [--format png|jpeg]');
  process.exit(1);
}

if (!['preview', 'final'].includes(mode)) {
  console.error('Invalid --mode. Use preview or final.');
  process.exit(1);
}

if (!['png', 'jpeg'].includes(screenshotType)) {
  console.error('Invalid --format. Use png or jpeg.');
  process.exit(1);
}

const rendererRoot = path.resolve(__dirname, '..');
const styleInputPath = path.join(rendererRoot, 'src', 'input.css');
const styleOutputPath = path.join(rendererRoot, 'public', 'style.css');
const tailwindConfigPath = path.join(rendererRoot, 'tailwind.config.js');
const slideDataFile = path.resolve(process.cwd(), dataPath);
const outputFolder = path.resolve(process.cwd(), outDir);

function getMtimeOrZero(filePath) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }

  return fs.statSync(filePath).mtimeMs;
}

function shouldBuildStyles() {
  if (!fs.existsSync(styleOutputPath)) {
    return true;
  }

  const outputMtime = getMtimeOrZero(styleOutputPath);
  const inputMtime = getMtimeOrZero(styleInputPath);
  const configMtime = getMtimeOrZero(tailwindConfigPath);

  return inputMtime > outputMtime || configMtime > outputMtime;
}

if (!skipBuild) {
  if (forceBuild || shouldBuildStyles()) {
    console.log('[Slide Renderer] Building Tailwind CSS...');
    execSync('npx @tailwindcss/cli -i src/input.css -o public/style.css', {
      cwd: rendererRoot,
      stdio: 'inherit',
    });
  } else {
    console.log('[Slide Renderer] Using cached CSS build.');
  }
}

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

function loadSlideData(filePath) {
  const rawData = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(rawData);
}

function collectRemoteAssets(slides) {
  const remoteAssets = new Set();

  slides.forEach((slide) => {
    const combined = `${slide.html || ''}\n${slide.css || ''}`;
    const matches = combined.match(/https?:\/\/[^\s"'()<>]+/g) || [];

    matches.forEach((match) => remoteAssets.add(match));
  });

  return Array.from(remoteAssets);
}

async function waitForSlideAssets(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;

    const images = Array.from(document.querySelectorAll('#content-area img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) {
          return typeof img.decode === 'function'
            ? img.decode().catch(() => {})
            : Promise.resolve();
        }

        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      })
    );
  });
}

async function waitForRenderFrame(page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  );
}

async function renderSlides() {
  console.log(`[Slide Renderer] Loading data from ${dataPath}...`);

  const data = loadSlideData(slideDataFile);
  const slides = Array.isArray(data.slides) ? data.slides : [];

  if (!slides.length) {
    console.error('[Slide Renderer] Error: No slides found in data file.');
    process.exit(1);
  }

  const remoteAssets = collectRemoteAssets(slides);
  if (remoteAssets.length > 0) {
    console.warn(`[Slide Renderer] Warning: ${remoteAssets.length} remote asset(s) detected. Rendering can be slower or non-deterministic.`);
  }

  const slideWidth = Number(data.meta?.width) || DEFAULT_SLIDE_WIDTH;
  const slideHeight = Number(data.meta?.height) || DEFAULT_SLIDE_HEIGHT;
  const globalEyebrow = data.meta?.eyebrow || '';
  const globalBrandLabel = data.meta?.brandLabel || data.meta?.brand || '';

  slides.forEach((slide) => {
    if (slide.eyebrow == null && globalEyebrow) {
      slide.eyebrow = globalEyebrow;
    }

    if (slide.brandLabel == null && globalBrandLabel) {
      slide.brandLabel = globalBrandLabel;
    }
  });

  console.log('[Slide Renderer] Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({
    width: slideWidth,
    height: slideHeight,
    deviceScaleFactor: mode === 'preview' ? 1 : 2,
  });

  const templatePath = `file://${path.resolve(__dirname, '../public/template.html')}`;
  await page.goto(templatePath, { waitUntil: 'load' });
  await page.evaluate(({ width, height }) => {
    document.documentElement.style.setProperty('--slide-width', `${width}px`);
    document.documentElement.style.setProperty('--slide-height', `${height}px`);
  }, { width: slideWidth, height: slideHeight });
  await waitForSlideAssets(page);

  console.log(`[Slide Renderer] Rendering ${slides.length} slides in ${mode} mode...`);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    await page.evaluate((slideObj, idx, total) => {
      window.renderSlide(slideObj, idx, total);
    }, slide, i, slides.length);

    await waitForRenderFrame(page);
    await waitForSlideAssets(page);

    const extension = screenshotType === 'jpeg' ? 'jpg' : 'png';
    const fileName = `slide_${String(i + 1).padStart(2, '0')}.${extension}`;
    const savePath = path.join(outputFolder, fileName);
    const screenshotOptions = {
      path: savePath,
      type: screenshotType,
    };

    if (screenshotType === 'jpeg') {
      screenshotOptions.quality = jpegQuality;
    }

    await page.screenshot(screenshotOptions);
    console.log(`  -> Saved: ${fileName}`);
  }

  await browser.close();
  console.log(`[Slide Renderer] All done. ${slides.length} images saved to ${outputFolder}`);
}

renderSlides().catch((err) => {
  console.error('Error rendering slides:', err);
  process.exit(1);
});
