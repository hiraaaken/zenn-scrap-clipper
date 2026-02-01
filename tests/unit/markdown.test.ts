import { describe, it, expect } from 'vitest';
import { convertHtmlToMarkdown, stripImageSize } from '../../src/lib/markdown.ts';

describe('stripImageSize', () => {
  it('should strip image size from markdown', () => {
    expect(stripImageSize('![alt](url =300x)')).toBe('![alt](url)');
    expect(stripImageSize('![](url =300x200)')).toBe('![](url)');
    expect(stripImageSize('![alt](url =300x) text')).toBe('![alt](url) text');
  });

  it('should not modify images without size', () => {
    expect(stripImageSize('![alt](url)')).toBe('![alt](url)');
  });
});

describe('convertHtmlToMarkdown', () => {
  it('should convert paragraphs', () => {
    const html = '<p>Hello</p><p>World</p>';
    const result = convertHtmlToMarkdown(html);
    expect(result).toBe('Hello\n\nWorld');
  });

  it('should convert bold and italic', () => {
    expect(convertHtmlToMarkdown('<strong>bold</strong>')).toBe('**bold**');
    expect(convertHtmlToMarkdown('<b>bold</b>')).toBe('**bold**');
    expect(convertHtmlToMarkdown('<em>italic</em>')).toBe('*italic*');
    expect(convertHtmlToMarkdown('<i>italic</i>')).toBe('*italic*');
  });

  it('should convert inline code', () => {
    expect(convertHtmlToMarkdown('<code>code</code>')).toBe('`code`');
  });

  it('should convert code blocks', () => {
    const html = '<pre><code class="language-typescript">const x = 1;</code></pre>';
    const result = convertHtmlToMarkdown(html);
    expect(result).toContain('```typescript');
    expect(result).toContain('const x = 1;');
    expect(result).toContain('```');
  });

  it('should convert links', () => {
    const html = '<a href="https://example.com">Example</a>';
    expect(convertHtmlToMarkdown(html)).toBe('[Example](https://example.com)');
  });

  it('should convert images', () => {
    const html = '<img src="https://example.com/img.png" alt="Image">';
    expect(convertHtmlToMarkdown(html)).toBe('![Image](https://example.com/img.png)');
  });

  it('should convert unordered lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const result = convertHtmlToMarkdown(html);
    expect(result).toContain('- Item 1');
    expect(result).toContain('- Item 2');
  });

  it('should convert ordered lists', () => {
    const html = '<ol><li>First</li><li>Second</li></ol>';
    const result = convertHtmlToMarkdown(html);
    expect(result).toContain('1. First');
    expect(result).toContain('2. Second');
  });

  it('should convert blockquotes', () => {
    const html = '<blockquote>Quote text</blockquote>';
    const result = convertHtmlToMarkdown(html);
    expect(result).toContain('> Quote text');
  });

  it('should convert headings', () => {
    expect(convertHtmlToMarkdown('<h1>Title</h1>')).toContain('# Title');
    expect(convertHtmlToMarkdown('<h2>Subtitle</h2>')).toContain('## Subtitle');
    expect(convertHtmlToMarkdown('<h3>Section</h3>')).toContain('### Section');
  });

  it('should convert line breaks', () => {
    const html = 'Line 1<br>Line 2';
    const result = convertHtmlToMarkdown(html);
    expect(result).toBe('Line 1\nLine 2');
  });

  it('should convert horizontal rules', () => {
    const html = '<p>Before</p><hr><p>After</p>';
    const result = convertHtmlToMarkdown(html);
    expect(result).toContain('---');
  });

  it('should normalize consecutive newlines between paragraph and code block', () => {
    const html = '<p>テキスト</p><pre><code>const x = 1;</code></pre>';
    const result = convertHtmlToMarkdown(html);
    // 3つ以上の連続改行が発生しないこと
    expect(result).not.toMatch(/\n{3,}/);
    expect(result).toContain('テキスト\n\n```');
  });

  it('should normalize consecutive newlines around horizontal rules', () => {
    const html = '<p>Before</p><hr><p>After</p>';
    const result = convertHtmlToMarkdown(html);
    expect(result).not.toMatch(/\n{3,}/);
    expect(result).toBe('Before\n\n---\n\nAfter');
  });
});
