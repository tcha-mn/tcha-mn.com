import { type BaseQueryOptions, nowDateTime as now, type PortableTextBlock } from './sanity';
import { INSTRUCTOR_QUERY_FRAGMENT, type Instructor } from './Instructor';
import type { ClassType } from './ClassType';
import { DateTime } from 'luxon';
import { parseDate } from '~/utils/dates';

export interface QueryOptions extends BaseQueryOptions {
  includeInstructors?: boolean;
}

export interface RawClass {
  _id: string;
  semester: string;
  title: string;
  description: PortableTextBlock[];
  class_type: ClassType;
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
  no_early_registration_discount: boolean;
  is_cancelled: boolean;
  early_registration_end?: string;
  dates: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    day_of_week?: string;
    custom_recurring?: string;
    start: string;
    end: string;
    breaks?: string[];
  };
  connect_class_id?: number;
  registration_link?: string;
}
export interface ParsedClass
  extends Omit<
    RawClass,
    'dates' | 'registration_open' | 'registration_close' | 'registration_link' | 'early_registration_end'
  > {
  isOpenForRegistration: boolean;
  isEarlyRegistration: boolean;
  registration_open: DateTime;
  registration_close: DateTime;
  early_registration_end?: DateTime;
  is_cancelled: boolean;
  dates: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    day_of_week?: string;
    day_of_month?: string;
    start: DateTime;
    end: DateTime;
    breaks?: DateTime[];
    isRecurring: boolean;
    toString(): string;
  };
  moreInfoLink: string;
  registrationLink?: string;
}
export const CLASS_QUERY_FRAGMENT = ({ picture, includeInstructors = false }: QueryOptions) => {
  const instructorFragment = `"instructors": instructors[]->${INSTRUCTOR_QUERY_FRAGMENT({ picture })},`;
  return `{
    _id,
    title,
    class_type,
    description,
    price,
    "semester": semester->name,
    ${picture('preview_image')},
    "alt": preview_image.asset->.alt,
    "registration_open": coalesce(registration_open, semester->.registration_open),
    "registration_close": coalesce(registration_close, coalesce(dates.start, semester->.dates.start)),
    registration_link,
    connect_class_id,
    "dates": coalesce(dates, semester->.dates),
    no_early_registration_discount,
    is_cancelled,
    "early_registration_end": semester->.early_registration_end,
    ${includeInstructors ? instructorFragment : ''}
    "classTimes": class_times,
    "grades": {
      "min": grade_minimum,
      "max": grade_maximum
    },
    "ages": {
      "min": age_minimum,
      "max": age_maximum
    }
  }`;
};

export function parseRawClass({
  registration_link,
  connect_class_id,
  dates,
  registration_open,
  registration_close,
  early_registration_end,
  ...c
}: RawClass): ParsedClass {
  const start = parseDate(dates.start);
  const end = parseDate(dates.end);
  const registrationOpen = parseDate(registration_open);
  const registrationClose = parseDate(registration_close);
  const earlyRegistrationEnd = early_registration_end ? parseDate(early_registration_end) : DateTime.now();

  const frequency =
    dates.frequency || (start.hasSame(end, 'day') ? 'once' : dates.custom_recurring ? 'custom' : 'weekly');
  const isRecurring = frequency !== 'once';
  return {
    ...c,
    isOpenForRegistration: registrationOpen < now && registrationClose >= now.startOf('day'),
    isEarlyRegistration: !c.no_early_registration_discount && earlyRegistrationEnd > now,
    early_registration_end: earlyRegistrationEnd,
    registration_open: registrationOpen,
    registration_close: registrationClose,
    moreInfoLink: `/${c.class_type.toLowerCase()}/#class-${c._id}`,
    registrationLink: connect_class_id
      ? `https://www.care.com/connect/tcha/series/${connect_class_id}`
      : registration_link,
    dates: {
      ...dates,
      start,
      end,
      breaks: dates.breaks?.map(parseDate),
      isRecurring,
      toString() {
        if (isRecurring) {
          return `${dates.custom_recurring || `Weekly on ${dates.day_of_week + 's'}`} from ${start.toLocaleString(DateTime.DATE_MED)} to ${end.toLocaleString(DateTime.DATE_MED)}`;
        } else {
          return start.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
        }
      },
    },
  };
}

export function parseRawClassArray(classes: RawClass[]): ParsedClass[] {
  return classes.map(parseRawClass);
}
