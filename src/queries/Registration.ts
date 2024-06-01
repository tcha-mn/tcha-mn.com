import { makeDataAccess, type BaseQueryOptions, now } from './sanity';
import { CLASS_QUERY_FRAGMENT, parseRawClassArray } from './Classes';

const OPEN_CLASS_RESTRICTION_FRAGMENT = `*[
  _type == "class"
  && coalesce(registration_open, semester->.registration_open) < ${now}
  && coalesce(registration_close, coalesce(dates.start, semester->.dates.start)) > ${now}
]`;

const isRegistrationOpenQuery = `count(${OPEN_CLASS_RESTRICTION_FRAGMENT}) > 0`;

const classesOpenForRegistrationQuery = (options: BaseQueryOptions) => `
${OPEN_CLASS_RESTRICTION_FRAGMENT} | order(coalesce(registration_close, coalesce(dates.start, semester->.dates.start)) asc, class_type, age_minimum, class_times.start)
  ${CLASS_QUERY_FRAGMENT(options)}
`;

export const isRegistrationOpen = makeDataAccess<boolean>(isRegistrationOpenQuery);
export const classesOpenForRegistration = makeDataAccess(classesOpenForRegistrationQuery, parseRawClassArray);
