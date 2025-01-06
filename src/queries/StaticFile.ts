import { makeDataAccess } from './sanity';

export interface StaticFile {
  slug: string;
  url: string;
}

const STATIC_FILE_QUERY = `*[_type == "static_file"] {
  "slug": slug.current,
  "url": file.asset->url
}`;
export const fetchAll = makeDataAccess<StaticFile[]>(STATIC_FILE_QUERY);
