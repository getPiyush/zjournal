import parse from 'html-react-parser';
import type { DOMNode, HTMLReactParserOptions } from 'html-react-parser';

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

  export const parsex = (html: string | string[]) => parse(typeof html === 'string' ? html : '', options);

  