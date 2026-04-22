import fs from 'fs';
import path from 'path';

const linksFile = 'c:/Users/b0583931/GitHub/MahdiSalem.com/medium_source_links.json';
const articlesDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/src/content/articles/fa/medium';

const linksData = JSON.parse(fs.readFileSync(linksFile, 'utf8'));
function cleanString(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[\u200c\u200d]/g, '') // Remove ZWNJ, ZWJ
        .replace(/[^\p{L}\d]/gu, '')    // Keep only letters and digits
        .replace(/ی/g, 'ي').replace(/ک/g, 'ك'); // Normalize Farsi to Arabic style for matching consistency
}

const items = linksData.items;

// Map to store link by cleaned identifiers
const linkMap = new Map();

items.forEach(item => {
    const link = item.preferred_link || item.post_link || item.canonical_link;
    if (!link) return;

    const identifiers = new Set();
    if (item.normalized_title) identifiers.add(item.normalized_title);
    if (item.best_title) identifiers.add(item.best_title);
    if (item.source_stem_clean) identifiers.add(item.source_stem_clean);
    if (item.title_from_content) identifiers.add(item.title_from_content);
    if (item.candidate_target_filenames) {
        item.candidate_target_filenames.forEach(name => identifiers.add(name));
    }

    // Extract slug from URL if possible
    [item.canonical_link, item.preferred_link, item.post_link].forEach(url => {
        if (!url) return;
        try {
            const decoded = decodeURIComponent(url);
            const slugPart = decoded.split('/').pop().replace(/-[a-z0-9]+$/, ''); // Remove the ID at the end
            if (slugPart && slugPart.length > 3) {
                identifiers.add(slugPart);
            }
        } catch (e) {}
    });

    identifiers.forEach(id => {
        if (id && !id.includes('?')) {
            linkMap.set(cleanString(id), link);
        }
    });
});

const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'));

let matchedCount = 0;
let totalCount = files.length;

files.forEach(file => {
    const filePath = path.join(articlesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Get title from frontmatter
    const titleMatch = content.match(/title:\s*"(.*)"/);
    const title = titleMatch ? titleMatch[1] : '';
    const slug = file.replace('.mdx', '');

    let matchedLink = linkMap.get(cleanString(slug)) || linkMap.get(cleanString(title));

    if (matchedLink) {
        matchedCount++;
        const footerLinkRegex = /توسط <a href="(.*?)">مهدی سالم<\/a> در <a href="(.*?)">(.*?)<\/a>/;
        
        const newContent = content.replace(footerLinkRegex, (match, authorLink, oldArticleLink, dateText) => {
            return `توسط <a href="${authorLink}">مهدی سالم</a> در <a href="${matchedLink}">${dateText}</a>`;
        });

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Updated link for: ${file} -> ${matchedLink}`);
        }
    } else {
        console.warn(`Could not find link for: ${file} (${title})`);
    }
});

console.log(`\nFinished: Matched ${matchedCount} out of ${totalCount} files.`);
