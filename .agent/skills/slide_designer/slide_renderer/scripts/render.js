const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// CLI 인자 파싱
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
    console.error("Usage: node render.js --data <path-to-json> --output <dir> [--skip-build]");
    process.exit(1);
}

if (!skipBuild) {
    console.log('[Slide Renderer] Building Tailwind CSS...');
    execSync('npx @tailwindcss/cli -i src/input.css -o public/style.css', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
    });
}

const slideDataFile = path.resolve(process.cwd(), dataPath);
const outputFolder = path.resolve(process.cwd(), outDir);

// 출력 폴더 없으면 생성
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

async function renderSlides() {
    console.log(`[Slide Renderer] Loading data from ${dataPath}...`);
    const data = JSON.parse(fs.readFileSync(slideDataFile, 'utf8'));
    const slides = data.slides;

    if (!slides || !slides.length) {
        console.error('[Slide Renderer] Error: No slides found in data file.');
        process.exit(1);
    }

    // 슬라이드별 html 필드 검증
    for (let i = 0; i < slides.length; i++) {
        if (!slides[i].html) {
            console.warn(`[Slide Renderer] Warning: Slide ${i + 1} has no 'html' field. It will render as blank.`);
        }
    }

    // meta에서 글로벌 eyebrow 가져오기
    const globalEyebrow = (data.meta && data.meta.eyebrow) || '';

    // 슬라이드별 eyebrow가 없으면 글로벌 eyebrow 적용
    slides.forEach(slide => {
        if (!slide.eyebrow && globalEyebrow) {
            slide.eyebrow = globalEyebrow;
        }
    });

    console.log(`[Slide Renderer] Launching Puppeteer...`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // 인스타그램 4:5 비율 뷰포트 설정 (레티나급 고화질)
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

    const templatePath = `file://${path.resolve(__dirname, '../public/template.html')}`;
    await page.goto(templatePath, { waitUntil: 'networkidle0' });

    // 폰트 로딩 대기
    await page.evaluate(() => document.fonts.ready);

    console.log(`[Slide Renderer] Rendering ${slides.length} slides...`);

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        // renderSlide 호출
        await page.evaluate((slideObj, idx, total) => {
            window.renderSlide(slideObj, idx, total);
        }, slide, i, slides.length);

        // CSS 적용 + 렌더링 대기
        await new Promise(r => setTimeout(r, 300));

        // 폰트 재확인
        await page.evaluate(() => document.fonts.ready);

        // 스크린샷 캡처
        const fileName = `slide_${String(i + 1).padStart(2, '0')}.png`;
        const savePath = path.join(outputFolder, fileName);

        await page.screenshot({ path: savePath, type: 'png' });
        console.log(`  -> Saved: ${fileName}`);
    }

    await browser.close();
    console.log(`[Slide Renderer] ✅ All done! ${slides.length} images saved to ${outputFolder}`);
}

renderSlides().catch(err => {
    console.error("Error rendering slides:", err);
    process.exit(1);
});
