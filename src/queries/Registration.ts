import { makeDataAccess, type BaseQueryOptions, now } from './sanity';
import { CLASS_QUERY_FRAGMENT, parseRawClassArray } from './Classes';

const OPEN_CLASS_RESTRICTION_FRAGMENT = `*[
  _type == "class"
  && dateTime(coalesce(registration_open, semester->.registration_open) + "T00:00:00-06:00") < ${now}
  && dateTime(coalesce(registration_close, coalesce(dates.start, semester->.dates.start)) + "T00:00:00-06:00") > (${now} - 60*60*24)
]`;

const isRegistrationOpenQuery = `count(${OPEN_CLASS_RESTRICTION_FRAGMENT}) > 0`;

const classesOpenForRegistrationQuery = (options: BaseQueryOptions) => `
${OPEN_CLASS_RESTRICTION_FRAGMENT} | order(coalesce(registration_close, coalesce(dates.start, semester->.dates.start)) asc, class_type, age_minimum, class_times.start)
  ${CLASS_QUERY_FRAGMENT(options)}
`;

export const isRegistrationOpen = makeDataAccess<boolean>(isRegistrationOpenQuery);
export const classesOpenForRegistration = makeDataAccess(classesOpenForRegistrationQuery, parseRawClassArray);
