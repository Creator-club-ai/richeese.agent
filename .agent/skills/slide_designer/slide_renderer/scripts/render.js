const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
let dataPath = '';
let outDir = '';
let skipBuild = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data') dataPath = args[i + 1];
    if (args[i] === '--output') outDir = args[i + 1];
    if (args[i] === '--skip-build') skipBuild = true;
}

if (!dataPath || !outDir) {
    console.error('Usage: node render.js --data <path-to-json> --output <dir> [--skip-build]');
    process.exit(1);
}

if (!skipBuild) {
    console.log('[Slide Renderer] Building Tailwind CSS...');
    execSync('npx @tailwindcss/cli -i src/input.css -o public/style.css', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
    });
}

const slideDataFile = path.resolve(process.cwd(), dataPath);
const outputFolder = path.resolve(process.cwd(), outDir);

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

function loadSlideData(filePath) {
    const rawData = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(rawData);
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

async function renderSlides() {
    console.log(`[Slide Renderer] Loading data from ${dataPath}...`);

    const data = loadSlideData(slideDataFile);
    const slides = Array.isArray(data.slides) ? data.slides : [];

    if (!slides.length) {
        console.error('[Slide Renderer] Error: No slides found in data file.');
        process.exit(1);
    }

    for (let i = 0; i < slides.length; i++) {
        if (!slides[i].html) {
            console.warn(`[Slide Renderer] Warning: Slide ${i + 1} has no 'html' field. It will render as blank.`);
        }
    }

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

    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

    const templatePath = `file://${path.resolve(__dirname, '../public/template.html')}`;
    await page.goto(templatePath, { waitUntil: 'networkidle0' });
    await waitForSlideAssets(page);

    console.log(`[Slide Renderer] Rendering ${slides.length} slides...`);

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        await page.evaluate((slideObj, idx, total) => {
            window.renderSlide(slideObj, idx, total);
        }, slide, i, slides.length);

        await waitForSlideAssets(page);
        await new Promise((resolve) => setTimeout(resolve, 50));

        const fileName = `slide_${String(i + 1).padStart(2, '0')}.png`;
        const savePath = path.join(outputFolder, fileName);

        await page.screenshot({ path: savePath, type: 'png' });
        console.log(`  -> Saved: ${fileName}`);
    }

    await browser.close();
    console.log(`[Slide Renderer] All done. ${slides.length} images saved to ${outputFolder}`);
}

renderSlides().catch((err) => {
    console.error('Error rendering slides:', err);
    process.exit(1);
});
