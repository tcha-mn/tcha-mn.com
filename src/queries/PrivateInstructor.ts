import type { Instructor } from './Instructor';
import { makeDynamicDataAccess, type BaseQueryOptions } from './sanity';

export interface PrivateInstructor extends Instructor {
  private_lessons: {
    instrument: string;
    email?: string;
    website?: string;
    phone?: string;
  };
}

const QUERY = ({ picture }: BaseQueryOptions) => `
*[_type == "instructor" && "Private Lessons" in class_types] {
  name,
  class_types,
  "bio": coalesce(class_type_bio[class_type == ^.^.class_type][0].bio, bio),
  ${picture('headshot')},
  private_lessons
} | order(name)
`;

export const fetchAll = makeDynamicDataAccess<PrivateInstructor[]>(QUERY);
