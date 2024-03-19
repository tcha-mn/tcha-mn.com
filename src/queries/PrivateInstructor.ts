import type { Instructor } from './Instructor';
import { makeDataAccess, type BaseQueryOptions } from './sanity';
import groq from 'groq';

export interface PrivateInstructor extends Instructor {
  private_lessons: {
    instrument: string;
    email?: string;
    website?: string;
    phone?: string;
  };
}

const QUERY = ({ picture }: BaseQueryOptions) => groq`
  *[_type == "instructor" && "Private Lessons" in class_types] {
    name,
    class_types,
    "bio": coalesce(class_type_bio[class_type == ^.^.class_type][0].bio, bio),
    ${picture('headshot')},
    private_lessons
  } | order(name)
`;
export const fetchAll = makeDataAccess<PrivateInstructor[]>(QUERY);
