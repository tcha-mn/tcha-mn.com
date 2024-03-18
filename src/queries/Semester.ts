import { makeDataAccess } from './sanity';

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

const QUERY_CURRENT = `*[_type == "semester" && registration_open >= now()][0]`;

export const getCurrentSemester = makeDataAccess<Semester[]>(QUERY_CURRENT);
