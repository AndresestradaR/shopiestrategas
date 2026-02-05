import { useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';

/**
 * SafeHtml - Renders HTML content sanitized with DOMPurify.
 * Used for admin-authored content like product descriptions and policy pages.
 *
 * Requires: npm install dompurify
 */
export default function SafeHtml({ html, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !html) return;

    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'a', 'strong', 'em', 'b', 'i', 'u',
        'span', 'div', 'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img', 'figure', 'figcaption',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt',
        'class', 'style',
        'width', 'height',
      ],
    });

    // Clear previous content safely
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

    // Parse and append sanitized content via DOM API
    const template = document.createElement('template');
    template.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    const fragment = document.createDocumentFragment();
    Array.from(doc.body.childNodes).forEach((node) => {
      fragment.appendChild(node.cloneNode(true));
    });
    ref.current.appendChild(fragment);
  }, [html]);

  return <div ref={ref} className={className} />;
}
