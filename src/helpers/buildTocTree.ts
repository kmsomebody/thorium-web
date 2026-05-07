import { Link, Locator } from "@readium/shared";

export interface TocItem {
  id: string;
  href: string;
  title?: string;
  children?: TocItem[];
  position?: number;
}

export type TocEntryRef = Omit<TocItem, "children">;

export const toEntryRef = ({ children: _, ...ref }: TocItem): TocEntryRef => ref;

export const buildTocTree = (
  links: Link[],
  idGenerator: () => string,
  positionsList?: Locator[],
  publicationTitle?: string
): TocItem[] => {
  return links.map((link) => {
    const newId = idGenerator();

    let href = link.href;
    const fragmentIndex = href.indexOf("#");
    if (fragmentIndex !== -1) {
      const baseHref = href.substring(0, fragmentIndex);
      const duplicateLink = links.find((l) => l.href.startsWith(baseHref) && l.href !== href);
      if (!duplicateLink) {
        href = baseHref;
      }
    }

    const counter = parseInt(newId.split("-")[1], 10);

    const treeNode: TocItem = {
      id: newId,
      href: href,
      title: link.title || (
        publicationTitle
          ? `${ publicationTitle } ${ counter }`
          : newId
      ),
      position: positionsList?.find((position) => position.href === href)?.locations.position
    };

    if (link.children) {
      treeNode.children = buildTocTree(link.children.items, idGenerator, positionsList, publicationTitle);
    }

    return treeNode;
  });
};

export const findTocItemById = (items: TocItem[], id: string): TocItem | undefined => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findTocItemById(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

export const findTocItemByHref = (items: TocItem[], href: string): TocItem | undefined => {
  // Pass 1: exact href match
  const exact = searchTocItems(items, (item) => item.href === href);
  if (exact) return exact;

  // Pass 2: bare href match (strip fragment on both sides)
  const bareHref = href.split("#")[0];
  return searchTocItems(items, (item) => item.href.split("#")[0] === bareHref);
};

const searchTocItems = (items: TocItem[], predicate: (item: TocItem) => boolean): TocItem | undefined => {
  for (const item of items) {
    if (predicate(item)) return item;
    if (item.children) {
      const found = searchTocItems(item.children, predicate);
      if (found) return found;
    }
  }
  return undefined;
};
