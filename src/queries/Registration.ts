import groq from 'groq';
import { makeDataAccess, type BaseQueryOptions } from './sanity';
import { CLASS_QUERY_FRAGMENT, parseRawClassArray } from './Classes';

const isRegistrationOpenQuery = groq`
count(*[_type == "class" && coalesce(registration_open, semester.registration_open) < now() && coalesce(registration_close, coalesce(dates.start, semester.dates.start)) > now()]) > 0
`;
const classesOpenForRegistrationQuery = (options: BaseQueryOptions) => `
*[_type == "class" && coalesce(registration_open, semester.registration_open) < now() && coalesce(registration_close, coalesce(dates.start, semester.dates.start)) > now()] | order(coalesce(registration_close, coalesce(dates.start, semester->.dates.start)) asc, class_times.start)
  ${CLASS_QUERY_FRAGMENT(options)}
`;

export const isRegistrationOpen = makeDataAccess<boolean>(isRegistrationOpenQuery);
export const classesOpenForRegistration = makeDataAccess(classesOpenForRegistrationQuery, parseRawClassArray);
