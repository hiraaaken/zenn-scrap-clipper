import type { ZennScrap, ZennComment } from '../types/zenn.ts';
import { convertHtmlToMarkdown } from './markdown.ts';

interface ScrapData {
  title: string;
  author: string;
  url: string;
  createdAt: Date;
  topics: string[];
  posts: PostData[];
}

interface PostData {
  htmlContent: string;
  createdAt: Date;
}

/**
 * Flatten nested comments using depth-first traversal.
 */
function flattenComments(comments: ZennComment[]): PostData[] {
  const result: PostData[] = [];

  function traverse(comment: ZennComment) {
    result.push({
      htmlContent: comment.body_html,
      createdAt: new Date(comment.created_at),
    });
    for (const child of comment.children) {
      traverse(child);
    }
  }

  for (const comment of comments) {
    traverse(comment);
  }

  return result;
}

/**
 * Convert ZennScrap to normalized ScrapData.
 */
function normalizeScrap(scrap: ZennScrap): ScrapData {
  const url = `https://zenn.dev/${scrap.user.username}/scraps/${scrap.slug}`;

  return {
    title: scrap.title,
    author: scrap.user.username,
    url,
    createdAt: new Date(scrap.created_at),
    topics: scrap.topics.map((t) => t.display_name),
    posts: flattenComments(scrap.comments),
  };
}

/**
 * Escape YAML string values.
 */
function escapeYamlString(str: string): string {
  if (/[:\-#&*!|>'"%@`[\]{}?,\n]/.test(str) || str.trim() !== str) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return str;
}

/**
 * Generate YAML frontmatter.
 */
function generateFrontmatter(data: ScrapData): string {
  const lines: string[] = ['---'];

  lines.push(`title: ${escapeYamlString(data.title)}`);
  lines.push(`author: ${escapeYamlString(data.author)}`);
  lines.push(`url: "${data.url}"`);
  lines.push(`created_at: "${formatDate(data.createdAt)}"`);

  if (data.topics.length > 0) {
    lines.push('topics:');
    for (const topic of data.topics) {
      lines.push(`  - ${escapeYamlString(topic)}`);
    }
  }

  lines.push(`exported_at: "${new Date().toISOString()}"`);
  lines.push('---');

  return lines.join('\n');
}

/**
 * Format date as YYYY-MM-DD.
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate complete Markdown document from ZennScrap.
 */
export function generateMarkdown(scrap: ZennScrap): string {
  const data = normalizeScrap(scrap);
  const parts: string[] = [];

  // Frontmatter
  parts.push(generateFrontmatter(data));
  parts.push('');

  // Title as H1
  parts.push(`# ${data.title}`);
  parts.push('');

  // Posts separated by horizontal rules
  const convertedPosts = data.posts.map((post) =>
    convertHtmlToMarkdown(post.htmlContent)
  );

  parts.push(convertedPosts.join('\n\n---\n\n'));

  return parts.join('\n');
}
