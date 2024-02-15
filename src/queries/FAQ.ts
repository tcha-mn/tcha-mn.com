import { makeDataAccess, type PortableTextBlock } from './sanity';

export interface FAQ {
  category: string;
  question: string;
  response: PortableTextBlock[];
}

const QUERY = `*[_type == "faq"] | order(question) {question, response, category}`;

export const fetchAll = makeDataAccess<FAQ[]>(QUERY);
