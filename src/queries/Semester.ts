import type { DateTime } from 'luxon';
import { makeDataAccess } from './sanity';
import { parseDate } from '~/utils/dates';

export interface RawSemester {
  name: string;
  dates: {
    day_of_week: string;
    breaks: string[];
    start: string;
    end: string;
  };
  registration_open: string;
  early_registration_end: string;
  block_schedule_pdf?: string;
}

export interface Semester extends Pick<RawSemester, 'name' | 'block_schedule_pdf'> {
  name: string;
  isPopup: boolean;
  dates: {
    day_of_week: string;
    breaks: DateTime[];
    start: DateTime;
    end: DateTime;
  };
  registration_open: DateTime;
  early_registration_end: DateTime;
}

const QUERY_CURRENT = `*[_type == "semester" && registration_open >= now()][0]`;
export const SEMESTER_QUERY_FRAGMENT = `{
  name,
  dates,
  registration_open,
  early_registration_end,
  "block_schedule_pdf": block_schedule.asset->url,
}`;

export function parseSemester(raw: RawSemester): Semester {
  return {
    name: raw.name,
    isPopup: raw.name === 'Pop-up',
    dates: {
      ...raw.dates,
      start: parseDate(raw.dates.start),
      end: parseDate(raw.dates.end),
      breaks: raw.dates.breaks?.map((date) => parseDate(date)),
    },
    registration_open: parseDate(raw.registration_open),
    early_registration_end: parseDate(raw.early_registration_end),
    block_schedule_pdf: raw.block_schedule_pdf,
  };
}

export const getCurrentSemester = makeDataAccess<Semester[]>(QUERY_CURRENT);
