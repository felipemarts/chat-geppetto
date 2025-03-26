import screenshot from 'screenshot-desktop';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const downloadPath = "./public/download";

const takeScreenshot = async (): Promise<string> => {
    try {
        if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath);
        }

        const screenshotFileName = `screenshot-${Date.now()}`;
        const screenshotPath = path.join(downloadPath, `${screenshotFileName}.png`);
        const compressedScreenshotPath = path.join(downloadPath, `${screenshotFileName}.jpg`);

        await screenshot({ filename: screenshotPath });

        const image = sharp(screenshotPath);

        const metadata = await image.metadata();
        const maxWidth = 2000;
        const maxHeight = 768;
        await image
            .resize({
                width: Math.min(maxWidth, metadata.width || maxWidth),
                height: Math.min(maxHeight, metadata.height || maxHeight),
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 }) 
            .toFile(compressedScreenshotPath);

        fs.rmSync(screenshotPath);
        console.log(`Screenshot saved to ${compressedScreenshotPath}`);
        return compressedScreenshotPath;
    } catch (err) {
        console.error('Error taking screenshot:', err);
        throw err;
    }
};

export default takeScreenshot;
