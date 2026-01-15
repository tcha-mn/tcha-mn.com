import type { Instructor } from './Instructor';
import { makeDataAccess, type BaseQueryOptions } from './sanity';

const PRIVATE_LESSONS = 'Private Lessons';

export interface PrivateInstructor extends Instructor {
  private_lessons: {
    instrument: string;
    email?: string;
    website?: string;
    phone?: string;
    in_home?: boolean;
  };
}

const QUERY = ({ picture }: BaseQueryOptions) => `
*[_type == "instructor" && "${PRIVATE_LESSONS}" in class_types] {
  name,
  class_types,
  "bio": coalesce(class_type_bio[class_type == "${PRIVATE_LESSONS}"][0].bio, bio),
  ${picture('headshot')},
  private_lessons
} | order(name)
`;

export const fetchAll = makeDataAccess<PrivateInstructor[]>(QUERY);
