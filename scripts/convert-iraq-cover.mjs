import sharp from 'sharp';
import fs from 'fs';

const input = 'C:\\Users\\mahhd\\.gemini\\antigravity\\brain\\1737c91b-74b7-4774-a11e-10dcbdb9e955\\iraq_intervention_abstract_cover_1775270677707.png';
const output = 'c:\\Intel\\MahdiSalem.com\\public\\images\\articles\\covers\\iraq-invasion-results.webp';

async function convert() {
    try {
        await sharp(input)
            .resize(1200)
            .webp({ quality: 80 })
            .toFile(output);
        console.log(`✅ Converted and resized: ${output}`);
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
    }
}

convert();
