import { ElementType } from "htmlparser2";
import { findNodes, getHtml, querySelector, querySelectorAll } from "./html";
import { Element } from "domhandler";

const CATALOG_HOME = "http://student.mit.edu/catalog/index.cgi";

export async function getCatalogPages() {
  const home = await getHtml(CATALOG_HOME);

  const baseLinks = querySelectorAll(home, "td[valign=top][align=left] > ul a[href]")
    .map(node => new URL(node.attribs.href, CATALOG_HOME));

  const allLinks = await Promise.all(baseLinks.map(async link => {
    const page = await getHtml(link);
    const otherLinks = querySelectorAll(page, '#contentmini > table a[href]')
      .map(node => new URL(node.attribs.href, link));
    return [link, ...otherLinks];
  }))

  return allLinks.flat();
}
