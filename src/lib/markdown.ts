/**
 * HTML to Markdown converter for Zenn scrap content.
 * Handles the HTML output from Zenn API's body_html field.
 */

/**
 * Strip Zenn-specific image size syntax: ![](url =300x) → ![](url)
 */
export function stripImageSize(markdown: string): string {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\s+=\d+x?\d*\)/g, '![$1]($2)');
}

/**
 * Convert HTML string to Markdown.
 * Handles common HTML tags used in Zenn scraps.
 */
export function convertHtmlToMarkdown(html: string): string {
  // Create a temporary DOM element to parse HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const result = processNode(doc.body);
  return stripImageSize(result.trim().replace(/\n{3,}/g, '\n\n'));
}

function processNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes)
    .map(processNode)
    .join('');

  switch (tagName) {
    case 'p':
      return `${children}\n\n`;

    case 'br':
      return '\n';

    case 'hr':
      return '\n---\n\n';

    case 'strong':
    case 'b':
      return `**${children}**`;

    case 'em':
    case 'i':
      return `*${children}*`;

    case 'code':
      // Check if this is inside a <pre> tag
      if (element.parentElement?.tagName.toLowerCase() === 'pre') {
        return children;
      }
      return `\`${children}\``;

    case 'pre': {
      const codeElement = element.querySelector('code');
      if (codeElement) {
        const lang = extractLanguage(codeElement);
        const code = codeElement.textContent || '';
        return `\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
      }
      return `\n\`\`\`\n${children}\n\`\`\`\n\n`;
    }

    case 'a': {
      const href = element.getAttribute('href') || '';
      // Skip empty anchor links (used for header anchors in Zenn)
      if (!children.trim()) {
        return '';
      }
      return `[${children}](${href})`;
    }

    case 'img': {
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    }

    case 'ul':
      return processListItems(element, '-') + '\n';

    case 'ol':
      return processListItems(element, 'number') + '\n';

    case 'li':
      return children;

    case 'blockquote':
      return (
        children
          .trim()
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n') + '\n\n'
      );

    case 'table':
      return processTable(element) + '\n\n';

    case 'h1':
      return `# ${children.trim()}\n\n`;
    case 'h2':
      return `## ${children.trim()}\n\n`;
    case 'h3':
      return `### ${children.trim()}\n\n`;
    case 'h4':
      return `#### ${children.trim()}\n\n`;
    case 'h5':
      return `##### ${children.trim()}\n\n`;
    case 'h6':
      return `###### ${children.trim()}\n\n`;

    case 'div':
    case 'span':
    case 'section':
    case 'article':
      return children;

    default:
      return children;
  }
}

function extractLanguage(codeElement: Element): string {
  const className = codeElement.className || '';
  const match = className.match(/(?:language-|lang-)(\w+)/);
  return match ? match[1] : '';
}

function processListItems(list: Element, type: '-' | 'number'): string {
  const items = Array.from(list.children)
    .filter((el) => el.tagName.toLowerCase() === 'li')
    .map((li, index) => {
      const prefix = type === 'number' ? `${index + 1}.` : '-';
      const content = processNode(li).trim();
      return `${prefix} ${content}`;
    });
  return items.join('\n');
}

function processTable(table: Element): string {
  const rows: string[][] = [];
  let hasHeader = false;

  // Process thead
  const thead = table.querySelector('thead');
  if (thead) {
    hasHeader = true;
    const headerRow = thead.querySelector('tr');
    if (headerRow) {
      rows.push(getRowCells(headerRow));
    }
  }

  // Process tbody
  const tbody = table.querySelector('tbody');
  const bodyRows = tbody
    ? Array.from(tbody.querySelectorAll('tr'))
    : Array.from(table.querySelectorAll('tr')).filter(
        (tr) => !thead?.contains(tr)
      );

  for (const tr of bodyRows) {
    rows.push(getRowCells(tr));
  }

  if (rows.length === 0) {
    return '';
  }

  // If no thead, treat first row as header
  if (!hasHeader && rows.length > 0) {
    hasHeader = true;
  }

  // Build markdown table
  const lines: string[] = [];
  const colCount = Math.max(...rows.map((r) => r.length));

  // Header row
  const headerCells = rows[0] || [];
  lines.push('| ' + padCells(headerCells, colCount).join(' | ') + ' |');

  // Separator row
  lines.push('| ' + Array(colCount).fill('---').join(' | ') + ' |');

  // Data rows
  for (let i = 1; i < rows.length; i++) {
    lines.push('| ' + padCells(rows[i], colCount).join(' | ') + ' |');
  }

  return lines.join('\n');
}

function getRowCells(tr: Element): string[] {
  return Array.from(tr.querySelectorAll('th, td')).map((cell) =>
    processNode(cell).trim().replace(/\|/g, '\\|').replace(/\n/g, ' ')
  );
}

function padCells(cells: string[], count: number): string[] {
  const result = [...cells];
  while (result.length < count) {
    result.push('');
  }
  return result;
}
