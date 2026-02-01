import type { ZennScrap, ZennComment } from '../types/zenn.ts';
import { convertHtmlToMarkdown } from './markdown.ts';

interface CommentGroup {
  posts: PostData[];
}

interface ScrapData {
  title: string;
  author: string;
  url: string;
  createdAt: Date;
  topics: string[];
  commentGroups: CommentGroup[];
}

interface PostData {
  htmlContent: string;
  createdAt: Date;
}

/**
 * トップレベルコメントごとにグループ化する。
 * 各グループは親コメントとその返信（DFS順）を含む。
 */
function groupCommentsByThread(comments: ZennComment[]): CommentGroup[] {
  return comments.map((comment) => {
    const posts: PostData[] = [];

    function traverse(c: ZennComment) {
      posts.push({
        htmlContent: c.body_html,
        createdAt: new Date(c.created_at),
      });
      for (const child of c.children) {
        traverse(child);
      }
    }

    traverse(comment);
    return { posts };
  });
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
    commentGroups: groupCommentsByThread(scrap.comments),
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

  // グループ内は改行のみ、グループ間は区切り線で結合
  const groups = data.commentGroups.map((group) =>
    group.posts
      .map((post) => convertHtmlToMarkdown(post.htmlContent))
      .join('\n\n')
  );

  parts.push(groups.join('\n\n---\n\n'));

  return parts.join('\n');
}
