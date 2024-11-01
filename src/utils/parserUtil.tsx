import parse, { Element } from 'html-react-parser';
import type { DOMNode, HTMLReactParserOptions } from 'html-react-parser';

const options: HTMLReactParserOptions = {
    replace(domNode: DOMNode) {
      if (
        domNode instanceof Element &&
        domNode.attribs &&
        domNode.attribs.class === 'remove'
      ) {
        return <></>;
      }
    },
  };

  export const parsex = (html) => parse(html, options);

  