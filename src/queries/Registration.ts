import groq from 'groq';
import { makeDataAccess, makeDynamicDataAccess, type BaseQueryOptions } from './sanity';
import { CLASS_QUERY_FRAGMENT, parseRawClassArray } from './Classes';

const isRegistrationOpenQuery = groq`
count(*[_type == "class" && coalesce(registration_open, semester.registration_open) < now() && coalesce(registration_close, coalesce(dates.start, semester.dates.start)) > now()]) > 0
`;
const classesOpenForRegistrationQuery = (options: BaseQueryOptions) => `
*[_type == "class" && coalesce(registration_open, semester.registration_open) < now() && coalesce(registration_close, coalesce(dates.start, semester.dates.start)) > now()]
  ${CLASS_QUERY_FRAGMENT(options)}
`;

export const isRegistrationOpen = makeDataAccess<boolean>(isRegistrationOpenQuery);
export const classesOpenForRegistration = makeDynamicDataAccess(classesOpenForRegistrationQuery, parseRawClassArray);
