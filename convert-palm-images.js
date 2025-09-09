// Convert palm images to base64 for testing
const fs = require('fs');

const convertImageToBase64 = (imagePath) => {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        return imageBuffer.toString('base64');
    } catch (error) {
        console.error(`Error reading ${imagePath}:`, error);
        return null;
    }
};

console.log('🖼️  Converting palm images to base64...\n');

const palm1Path = '/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg';
const palm2Path = '/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg';

const palm1Base64 = convertImageToBase64(palm1Path);
const palm2Base64 = convertImageToBase64(palm2Path);

if (palm1Base64 && palm2Base64) {
    console.log('✅ Successfully converted both images');
    console.log(`📏 Palm 1 size: ${palm1Base64.length} characters`);
    console.log(`📏 Palm 2 size: ${palm2Base64.length} characters`);
    
    const palmData = {
        palm1: palm1Base64,
        palm2: palm2Base64,
        timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('palm-images-base64.json', JSON.stringify(palmData, null, 2));
    console.log('💾 Saved to palm-images-base64.json');
} else {
    console.log('❌ Failed to convert images');
}