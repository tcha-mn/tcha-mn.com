import type { Instructor } from './Instructor';
import type { ClassType } from './ClassType';

import { makeDataAccess, type BaseQueryOptions } from './sanity';

export interface Semester {
  name: string;
  dates: {
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
export interface Class {
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
  dates?: { day_of_week: string; start: string; end: string };
}

const QUERY = ({ classType, registration, picture }: QueryOptions) => `*[
    _type == "semester" &&
    registration_open < now() &&
    ${registration === 'open' ? 'dates.start < now()' : ''}
    dates.end > now()
  ] | order(registration_open) {
  "semester": { name, dates, registration_open, early_registration_end },
  "classes": *[_type == "class" ${classType ? ' && class_type == "' + classType + '"' : ''} && references(^._id)
] | order(age_minimum, age_maximum) {
    _id,
    title,
    description,
    price,
    ${picture('preview_image')},
    "alt": preview_image.asset->alt,
    dates,
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

function processor(result: Result) {
  return result.map((r) => {
    console.log(r.semester.dates);
    return { ...r };
  });
}

type Result = {
  semester: Semester;
  classes: Class[];
}[];

export const fetchAll = makeDataAccess<Result, QueryOptions>(QUERY, processor);
