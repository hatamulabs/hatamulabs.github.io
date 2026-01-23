#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories
const DRAFTS_DIR = path.join(__dirname, 'drafts', 'blogs');
const BLOGS_DIR = path.join(__dirname, 'blogs');
const OUTPUT_FILE = path.join(__dirname, 'blogs.json');

// Ensure blogs directory exists
if (!fs.existsSync(BLOGS_DIR)) {
    fs.mkdirSync(BLOGS_DIR, { recursive: true });
}

function extractMetadata(markdown) {
    const lines = markdown.split('\n');
    const metadata = {
        title: 'Untitled',
        date: new Date().toISOString(),
        excerpt: ''
    };

    // Look for metadata in the first few lines
    // Format: ---
    // title: My Blog Title
    // date: 2026-01-23
    // ---

    let inFrontmatter = false;
    let frontmatterEnd = 0;

    for (let i = 0; i < Math.min(20, lines.length); i++) {
        const line = lines[i].trim();

        if (line === '---') {
            if (!inFrontmatter) {
                inFrontmatter = true;
                frontmatterEnd = i;
            } else {
                frontmatterEnd = i;
                break;
            }
            continue;
        }

        if (inFrontmatter) {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
                const [, key, value] = match;
                if (key === 'title') {
                    metadata.title = value.trim();
                } else if (key === 'date') {
                    metadata.date = new Date(value.trim()).toISOString();
                }
            }
        }
    }

    // If no frontmatter, try to extract title from first heading
    if (!inFrontmatter) {
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ')) {
                metadata.title = trimmed.substring(2).trim();
                break;
            }
        }
    }

    // Extract excerpt from first paragraph
    let foundTitle = false;
    for (const line of lines.slice(frontmatterEnd + 1)) {
        const trimmed = line.trim();

        // Skip empty lines and headings
        if (!trimmed || trimmed.startsWith('#')) {
            if (trimmed.startsWith('#')) foundTitle = true;
            continue;
        }

        // Found first substantial paragraph
        if (foundTitle && trimmed.length > 20) {
            // Remove markdown formatting
            let excerpt = trimmed
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
                .replace(/`/g, '');

            // Truncate to ~150 characters
            if (excerpt.length > 150) {
                excerpt = excerpt.substring(0, 147) + '...';
            }

            metadata.excerpt = excerpt;
            break;
        }
    }

    return metadata;
}

function generateSlug(filename) {
    // Remove .md extension and convert to slug
    return filename
        .replace(/\.md$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function processBlogs() {
    const blogs = [];

    try {
        // Check if drafts directory exists
        if (!fs.existsSync(DRAFTS_DIR)) {
            console.log('No drafts directory found. Creating it...');
            fs.mkdirSync(DRAFTS_DIR, { recursive: true });
            return blogs;
        }

        const files = fs.readdirSync(DRAFTS_DIR);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        if (mdFiles.length === 0) {
            console.log('No markdown files found in drafts/blogs/');
            return blogs;
        }

        for (const file of mdFiles) {
            const draftPath = path.join(DRAFTS_DIR, file);
            const content = fs.readFileSync(draftPath, 'utf-8');

            const metadata = extractMetadata(content);
            const slug = generateSlug(file);

            // Copy to blogs directory
            const publishPath = path.join(BLOGS_DIR, `${slug}.md`);
            fs.writeFileSync(publishPath, content, 'utf-8');

            blogs.push({
                slug: slug,
                title: metadata.title,
                date: metadata.date,
                excerpt: metadata.excerpt
            });

            console.log(`  ✓ Published: ${metadata.title} (${slug})`);
        }

        // Sort by date (newest first)
        blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        return blogs;
    } catch (error) {
        console.error('Error processing blogs:', error);
        return [];
    }
}

function main() {
    console.log('Processing blog posts from drafts/blogs/...\n');

    const blogs = processBlogs();

    console.log(`\nFound ${blogs.length} blog post(s)`);

    // Write to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(blogs, null, 2), 'utf-8');
    console.log(`\nBlog data written to: ${OUTPUT_FILE}`);

    if (blogs.length > 0) {
        console.log('\nPublished blogs:');
        blogs.forEach(blog => {
            console.log(`  - ${blog.title} (${new Date(blog.date).toLocaleDateString()})`);
        });
    }
}

main();
