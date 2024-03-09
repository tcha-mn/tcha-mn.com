import { makeDataAccess } from './sanity';

export interface Value {
  category: string;
  value: string;
}
const QUERY = '*[_type == "value"] | order(orderRank)';

export const fetchAll = makeDataAccess<Value[]>(QUERY);
