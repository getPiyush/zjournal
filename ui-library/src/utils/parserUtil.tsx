import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import type { DOMNode, HTMLReactParserOptions } from 'html-react-parser';

// Everything parsex renders is treated as untrusted. Articles include titles and snippets scraped
// from other sites (article-generator), and React 18 renders <iframe srcdoc>, <script>/<embed>
// elements and javascript: URLs from parsed markup. DOMPurify strips those (plus event handlers)
// and keeps the plain formatting markup stored content actually uses.
// A private instance, so the hook below doesn't leak into a host app's own DOMPurify.
const purifier = DOMPurify(window);

// Stored article links use target="_blank", which DOMPurify drops by default. Keep it, and stop
// the opened page from getting a handle back to ours.
purifier.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export const sanitizeHtml = (html: string) => purifier.sanitize(html, { ADD_ATTR: ['target'] });

const options: HTMLReactParserOptions = {
    // Duck-typed instead of `domNode instanceof Element`: nested transitive
    // copies of `domhandler` (pulled in separately by html-react-parser and
    // html-dom-parser) can produce Element classes that aren't referentially
    // equal, which makes `instanceof` unreliable here.
    replace(domNode: DOMNode) {
      if (
        domNode.type === 'tag' &&
        domNode.attribs &&
        domNode.attribs.class === 'remove'
      ) {
        return <></>;
      }
    },
  };

  export const parsex = (html: string | string[]) =>
    parse(typeof html === 'string' ? sanitizeHtml(html) : '', options);

  