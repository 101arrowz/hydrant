import { WritableStream as HtmlParseStream } from "htmlparser2/lib/WritableStream";
import { ChildNode, DomHandler, Element, Node } from "domhandler";
import { Writable } from "stream";
import { ElementType } from "htmlparser2";
import { selectOne, selectAll } from "css-select";

export async function getHtml(url: string | URL) {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new TypeError(`http request to ${url} failed`);
  }
  const handler = new DomHandler();
  const parseStream = new HtmlParseStream(handler);
  await res.body.pipeTo(Writable.toWeb(parseStream));
  return handler.root;
}

/**
 * @param node The current DOM node
 * @returns Whether or not to stop traversing
 */
export type DocumentWalker = (node: ChildNode) => boolean;

export function walk(root: ChildNode, walker: DocumentWalker) {
  const stop = walker(root);
  if (!stop && (
    root.type !== ElementType.Text &&
    root.type !== ElementType.Comment &&
    root.type !== ElementType.Directive
  )) {
    for (const child of root.childNodes) {
      walk(child, walker);
    }
  }
}

export function findNodes<S extends ChildNode>(root: ChildNode, selector: (node: ChildNode) => node is S): S[];
export function findNodes(root: ChildNode, selector: (node: ChildNode) => boolean): ChildNode[];
export function findNodes(root: ChildNode, selector: (node: ChildNode) => boolean): ChildNode[] {
  const nodes: ChildNode[] = [];
  walk(root, node => {
    if (selector(node)) {
      nodes.push(node);
    }
    return false;
  });
  return nodes;
}

export function querySelector(root: Node, query: string) {
  return selectOne<Node, Element>(query, root);
}

export function querySelectorAll(root: Node, query: string) {
  return selectAll<Node, Element>(query, root);
}