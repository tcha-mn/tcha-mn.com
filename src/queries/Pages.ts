import type { PortableTextBlock } from 'sanity';
import type { BaseQueryOptions } from './sanity';
import { makeDataAccess } from './sanity';

export interface Page {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  heading: string;
  subheading: string;
  hero: {
    image: string;
    alt: string;
  };
  body: PortableTextBlock[];
  meta_title: string;
  meta_description: string;
  allow_indexing: boolean;
}

const QUERY_BASE = ``;

const PAGE_QUERY = ({ picture }: BaseQueryOptions) => `*[_type == "page"] {
  _id,
  name,
  slug,
  heading,
  subheading,
  "hero": {
    ${picture('hero.image', { as: 'image' })},
    "alt": hero.alt
  },
  body,
  meta_title,
  meta_description,
  allow_indexing
}`;

export const fetchAll = makeDataAccess<Page[]>(PAGE_QUERY);

const MENU_QUERY = `*[_type=="page" && menu_dropdown!=null] {
  name,
  slug,
  menu_dropdown
}`;

export const fetchMenuPages = makeDataAccess<string[]>(MENU_QUERY);
