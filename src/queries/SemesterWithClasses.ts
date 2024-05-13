import { makeDynamicDataAccess, type BaseQueryOptions, now } from './sanity';
import { CLASS_QUERY_FRAGMENT, parseRawClassArray, type ParsedClass, type RawClass } from './Classes';
import { SEMESTER_QUERY_FRAGMENT, parseSemester, type Semester } from './Semester';

export interface SemesterStringDates {
  name: string;
  dates: {
    day_of_week: string;
    breaks: string[];
    start: string;
    end: string;
  };
  registration_open: string;
  early_registration_end: string;
}
interface QueryOptions extends BaseQueryOptions {
  classType?: string;
  registration?: 'open' | 'closed';
}

const QUERY = ({ classType, registration, picture }: QueryOptions) => `
*[
  _type == "semester" &&
  coalesce(date_visible, registration_open) < ${now} &&
  dates.end > ${now}
  ${registration === 'open' ? `&& dates.start < ${now}` : ''}
] | order(registration_open) {
  "semester": ${SEMESTER_QUERY_FRAGMENT},
  "classes": *[
    _type == "class"
    ${classType ? ' && class_type == "' + classType + '"' : ''} &&
    references(^._id) &&
    coalesce(dates, ^.dates).end > ${now}
  ] | order(age_minimum, age_maximum) ${CLASS_QUERY_FRAGMENT({ picture, includeInstructors: true })}
}`;

type Result = {
  semester: SemesterStringDates;
  classes: RawClass[];
}[];
export type ProcessedResult = {
  semester: Semester;
  classes: ParsedClass[];
}[];

function processResults(raw: Result): ProcessedResult {
  return raw
    .map(({ semester, classes }) => {
      return {
        semester: parseSemester(semester),
        classes: parseRawClassArray(classes),
      };
    })
    .filter(({ classes }) => classes.length > 0)
    .sort((a, b) => Number(b.semester.isPopup) - Number(a.semester.isPopup));
}

export const fetchAll = makeDynamicDataAccess(QUERY, processResults);
