import { describe, it, expect } from 'vitest';
import { generateMarkdown } from '../../src/lib/converter.ts';
import type { ZennScrap } from '../../src/types/zenn.ts';
import sampleScrap from '../fixtures/sample-scrap.json';

describe('generateMarkdown', () => {
  it('should generate markdown with frontmatter', () => {
    const scrap = sampleScrap.scrap as ZennScrap;
    const result = generateMarkdown(scrap);

    // Check frontmatter (title without quotes since it has no special chars needing escape)
    expect(result).toMatch(/^---\n/);
    expect(result).toContain('title: TypeScriptの学習メモ');
    expect(result).toContain('author: testuser');
    expect(result).toContain('url: "https://zenn.dev/testuser/scraps/abc123"');
    expect(result).toContain('created_at: "2025-07-17"');
    expect(result).toContain('topics:');
    expect(result).toContain('  - TypeScript');
    expect(result).toContain('  - JavaScript');
    expect(result).toContain('exported_at:');
    expect(result).toMatch(/---\n\n# TypeScriptの学習メモ/);
  });

  it('should include all comments in order', () => {
    const scrap = sampleScrap.scrap as ZennScrap;
    const result = generateMarkdown(scrap);

    // Check content is present
    expect(result).toContain('最初のコメントです');
    expect(result).toContain('**太字**');
    expect(result).toContain('*斜体*');
    expect(result).toContain('ネストしたコメントです');
    expect(result).toContain('const x: number = 1;');
    expect(result).toContain('[Example](https://example.com)');
    expect(result).toContain('![画像](https://example.com/image.png)');
  });

  it('should flatten nested comments depth-first', () => {
    const scrap = sampleScrap.scrap as ZennScrap;
    const result = generateMarkdown(scrap);

    // Nested comment should come after its parent, before the next sibling
    const firstCommentIndex = result.indexOf('最初のコメントです');
    const nestedCommentIndex = result.indexOf('ネストしたコメントです');
    const thirdCommentIndex = result.indexOf('リンクのテスト');

    expect(firstCommentIndex).toBeLessThan(nestedCommentIndex);
    expect(nestedCommentIndex).toBeLessThan(thirdCommentIndex);
  });

  it('should separate posts with horizontal rules', () => {
    const scrap = sampleScrap.scrap as ZennScrap;
    const result = generateMarkdown(scrap);

    // Count horizontal rules (posts are separated by ---)
    const hrMatches = result.match(/\n\n---\n\n/g) || [];
    // 3 posts = 2 separators
    expect(hrMatches.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty topics', () => {
    const scrap: ZennScrap = {
      ...sampleScrap.scrap as ZennScrap,
      topics: [],
    };
    const result = generateMarkdown(scrap);

    expect(result).not.toContain('topics:');
  });

  it('should escape special characters in title', () => {
    const scrap: ZennScrap = {
      ...sampleScrap.scrap as ZennScrap,
      title: 'Title: with "quotes" and #special',
    };
    const result = generateMarkdown(scrap);

    expect(result).toContain('title: "Title: with \\"quotes\\" and #special"');
  });
});
