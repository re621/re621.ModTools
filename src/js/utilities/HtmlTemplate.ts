/**
 * Code from [Observable's stdlib](https://github.com/observablehq/stdlib).
 *
 * Copyright 2018-2022 Observable, Inc.
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */
type RenderFunction<T extends Node> = (string: string) => T;
type WrapperFunction<T extends Node> = () => T;
/**
 * Framework for creating a template string tag.
 *
 * Adapted from https://github.com/observablehq/stdlib/blob/main/src/template.js
 *
 * Explicitly & properly handles these templated value types:
 * * `Node`
 * * `Array`s of any of these types (including `Array`s of these types)
 *
 * All other types will be assumed/coerced to be `string`s.
 * @param render string
 * @param wrapper Creates a new `Node` to store the output if the constructed `Node` isn't a single, non-`DocumentFragment` `Node`.
 * @returns A function that accepts spread params & returns the generated value; will not return a `DocumentFragment`.
 */
export function template<T extends Node, T1 extends Node, T2 extends Node>(render: RenderFunction<T1>, wrapper: WrapperFunction<T2>) {
  return function(strings: Readonly<string[]>, ...args: unknown[]) {
    const parts: Node[] = [];
    let string = strings[0] || "",
        part: Node | Array<any> | any,
        root: Node | DocumentFragment | T1 | null = null,
        node: Node,
        k = -1;
    args.unshift(strings);

    // Concatenate the text, using comments as placeholders for already-instantiated `Node`s.
    for (let i = 1, n = args.length; i < n; ++i) {
      part = args[i];
      if (part instanceof Node) {
        parts[++k] = part;
        string += "<!--o:" + k + "-->";
      } else if (Array.isArray(part)) {
        for (let j = 0, m = part.length; j < m; ++j) {
          const node = part[j];
          if (node instanceof Node) {
            if (root === null) {
              parts[++k] = root = document.createDocumentFragment();
              string += "<!--o:" + k + "-->";
            }
            root.appendChild(node);
          } else {
            root = null;
            string += node;
          }
        }
        root = null;
      } else {
        string += part;
      }
      string += strings[i];
    }

    // Render the text.
    root = render(string);

    // Walk the rendered content to replace comment placeholders for already-instantiated `Node`s.
    if (++k > 0) {
      const nodes = new Array<Node>(k);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (/^o:/.test(node.nodeValue || "")) { // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          nodes[+node.nodeValue!.slice(2)] = node;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      for (let i = 0, node = nodes[i]!; i < k; node = nodes[++i]!) { // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        node?.parentNode?.replaceChild(parts[i]!, node);
      }
    }

    // Is the rendered content
    // … a parent of a single child? Detach and return the child.
    // … a document fragment? Replace the fragment with an element.
    // … some other node? Return it.
    return (root.childNodes.length === 1
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? root.removeChild(root.firstChild!)
      : root.nodeType === Node.DOCUMENT_FRAGMENT_NODE
        ? ((node = wrapper()).appendChild(root), node)
        : root) as Node as T;
  };
}

/**
 * A tagged template literal to generate HTML.
 *
 * Adapted from https://github.com/observablehq/stdlib/blob/main/src/html.js
 */
export const html: { <T extends Node>(strings: Readonly<string[]>, ...args: unknown[]): T } = template(
  function(string: string) {
    const template = document.createElement("template");
    template.innerHTML = string.trim();
    return document.importNode(template.content, true);
  },
  function() { return document.createElement("span"); },
);