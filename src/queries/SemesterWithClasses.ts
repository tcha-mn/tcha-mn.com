import { parseDate, DateTime } from '~/utils/dates';
import type { Instructor } from './Instructor';
import type { ClassType } from './ClassType';

import { makeDataAccess, type BaseQueryOptions } from './sanity';

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
export interface Semester {
  name: string;
  isPopup: boolean;
  dates: {
    day_of_week: string;
    start: DateTime;
    end: DateTime;
    breaks: DateTime[];
  };
  registration_open: DateTime;
  early_registration_end: DateTime;
}

interface QueryOptions extends BaseQueryOptions {
  classType?: string;
  registration?: 'open' | 'closed';
}
interface ClassStringDates {
  _id: string;
  _createdAt: Date;
  title: string;
  description: string;
  classType: ClassType;
  ages: { min: number; max: number };
  grades: { min: string; max: string };
  spots: number;
  price: number;
  preview_image: {
    _type: string;
    alt: string;
    asset: {
      _ref: string;
    };
  };
  instructors: Instructor[];
  classTimes: { _type: string; start: string; end: string };
  registration_open: string;
  registration_close: string;
  dates: { day_of_week: string; start: string; end: string; breaks: string[] };
  connect_class_id?: number;
  registration_link?: string;
}
export interface Class extends Omit<ClassStringDates, 'dates' | 'registration_open' | 'registration_close'> {
  registration_open: DateTime;
  registration_close: DateTime;
  isOpenForRegistration: boolean;
  registrationLink?: string;
  dates: { day_of_week: string; start: DateTime; end: DateTime; breaks: DateTime[] };
}

const QUERY = ({ classType, registration, picture }: QueryOptions) => `*[
    _type == "semester" &&
    registration_open < now() &&
    ${registration === 'open' ? 'dates.start < now()' : ''}
    dates.end > now()
  ] | order(registration_open) {
  "semester": {
    name,
    dates,
    registration_open,
    early_registration_end,
    breaks,
    day_of_week
  },
  "classes": *[_type == "class" ${classType ? ' && class_type == "' + classType + '"' : ''} && references(^._id)
] | order(age_minimum, age_maximum) {
    _id,
    title,
    description,
    price,
    ${picture('preview_image')},
    "alt": preview_image.asset->alt,
    "registration_open": coalesce(registration_open, semester->registration_open),
    "registration_close": coalesce(registration_close, coalesce(dates.start, semester->dates.start)),
    registration_link,
    "dates": coalesce(dates, semester->dates),
    "instructors": instructors[]->{
      _id,
      name,
      ${picture('headshot')},
      class_types,
      "bio": coalesce(class_type_bio[class_type == ^.^.class_type][0].bio, bio),
    },
    "classTimes": class_times,
    "grades": { "min": grade_minimum, "max": grade_maximum },
    "ages": {"min": age_minimum, "max": age_maximum},
  }
}`;

type Result = {
  semester: SemesterStringDates;
  classes: ClassStringDates[];
}[];
export type ProcessedResult = {
  semester: Semester;
  classes: Class[];
}[];

function processResults(raw: Result): ProcessedResult {
  return raw
    .map(({ semester, classes }) => {
      return {
        semester: {
          ...semester,
          isPopup: semester.name === 'Pop-up',
          dates: {
            ...semester.dates,
            breaks: (semester.dates.breaks || []).map(parseDate),
            start: parseDate(semester.dates.start),
            end: parseDate(semester.dates.end),
          },
          registration_open: parseDate(semester.registration_open),
          early_registration_end: parseDate(semester.early_registration_end),
        },
        classes: classes.map(({ registration_link, connect_class_id, ...c }) => {
          const start = parseDate(c.dates.start);
          const end = parseDate(c.dates.end);
          const registrationOpen = parseDate(c.registration_open);
          const registrationClose = parseDate(c.registration_close);
          return {
            ...c,
            isOpenForRegistration: registrationOpen < DateTime.now() && registrationClose > DateTime.now(),
            registration_open: registrationOpen,
            registration_close: registrationClose,
            registrationLink: connect_class_id
              ? `https://www.care.com/connect/tcha/series/${connect_class_id}`
              : registration_link,
            dates: {
              ...c.dates,
              start,
              end,
              breaks: c.dates.breaks?.map(parseDate),
            },
          };
        }),
      };
    })
    .filter(({ classes }) => classes.length > 0)
    .sort((a, b) => Number(b.semester.isPopup) - Number(a.semester.isPopup));
}

export const fetchAll = makeDataAccess(QUERY, processResults);
