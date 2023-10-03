import { getHtml, querySelector, querySelectorAll } from "./html";

const CATALOG_HOME = "http://student.mit.edu/catalog/index.cgi";

async function getCatalogPages() {
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

async function findCourses(page: URL) {
  const doc = await getHtml(page);
  const courses = querySelector(doc, "table[width=\"100%\"][border=\"0\"] td");
  // TODO: parse
  return [];
}

export async function reloadCatalog() {
  const catalogPages = await getCatalogPages();
  const allCourses = (await Promise.all(catalogPages.map(findCourses))).flat();
  // TODO: save to disk
  console.log(allCourses);
}
