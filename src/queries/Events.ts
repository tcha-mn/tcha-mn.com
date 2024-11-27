import {
  groqDateTimeFromDate,
  makeDynamicDataAccess,
  type BaseQueryOptions,
  type PortableTextBlock,
  type SanityImageObject,
} from './sanity';
import type { DateTime } from 'luxon';
import { now } from './sanity';
import { parseDate } from '~/utils/dates';

interface EventRaw {
  dates: string[];
  publish_date: string;
  ticket_link: string | null;
  description: null | PortableTextBlock[];
  thumbnail: SanityImageObject;
  hero: SanityImageObject;
  announcement: {
    headline: string;
    description: string;
  };
  slug: string;
  title: string;
  location: string;
}

interface EventParsed extends Omit<EventRaw, 'dates' | 'publish_date'> {
  dates: DateTime[];
  publish_date: DateTime;
}

interface RelatedQueryOpts extends BaseQueryOptions {
  classType?: string;
  show?: string;
}

const EVENT_FIELDS = ({ picture }: BaseQueryOptions) => `
  dates,
  "slug": slug.current,
  announcement,
  title,
  location,
  publish_date,
  ticket_link,
  description,
  ${picture('thumbnail')},
  ${picture('hero')}
`;
const RELATED_EVENTS_QUERY = ({ classType, show, picture }: RelatedQueryOpts) => `
*[_type=="event"
  && ${groqDateTimeFromDate('publish_date')} < ${now}
  ${classType ? `&& "class" in related_entities[]->_type && "${classType}" in related_entities[]->class_type` : ''}
  ${show ? `&& "show" in related_entities[]->_type && "${show}" in related_entities[]->slug.current` : ''}
  && count(dates[@ > now()]) > 0] { ${EVENT_FIELDS({ picture })} }
`;

interface EventDetailsQueryOpts extends BaseQueryOptions {
  eventSlug: string;
}

const EVENT_DETAILS = ({ eventSlug, picture }: EventDetailsQueryOpts) =>
  `*[_type=="event" && slug.current == "${eventSlug}"] { ${EVENT_FIELDS({ picture })} }`;

function processResults(raw: EventRaw[]): EventParsed[] {
  return raw.map((event) => ({
    ...event,
    dates: event.dates.map((date) => parseDate(date)),
    publish_date: parseDate(event.publish_date),
  }));
}

export const getRelatedEvents = makeDynamicDataAccess(RELATED_EVENTS_QUERY, processResults);

export const lookupEvent = makeDynamicDataAccess(EVENT_DETAILS, processResults);
export type { EventParsed as Event };
