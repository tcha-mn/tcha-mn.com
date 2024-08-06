import groq from 'groq';
import { makeDataAccess, type BaseQueryOptions, type SanityImageObject } from './sanity';

export interface Sponsor {
  name: string;
  logo: SanityImageObject;
  url: string;
}
const QUERY = ({ picture }: BaseQueryOptions) => groq`
  *[_type == "sponsor" && start_date <= now() && end_date >= now()] | order(name) {
    name,
    url,
    ${picture('logo')},
  }
`;

export const fetchActive = makeDataAccess<Sponsor[]>(QUERY);
