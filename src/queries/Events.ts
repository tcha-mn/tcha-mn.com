import { makeDataAccess, type BaseQueryOptions } from './sanity';

interface RelatedQueryOpts extends BaseQueryOptions {
  eventType: string;
}
const RELATED_EVENTS_QUERY = ({ eventType, picture }: RelatedQueryOpts) => `
*[_type=="event" && publish_date < now() && "${eventType}" in related_entities[]->_type && count(dates[@ > now()]) > 0] {
  dates,
  slug,
  announcement,
  title,
  location,
  publish_date,
  description,
  ${picture('thumbnail')}
}`;

interface EventDetailsQueryOpts extends BaseQueryOptions {
  eventSlug: string;
}

const EVENT_DETAILS = ({ eventSlug, picture }: EventDetailsQueryOpts) => `
*[_type=="event" && slug.current == "${eventSlug}"] {
  dates,
  slug,
  announcement,
  title,
  location,
  publish_date,
  description,
  ${picture('thumbnail')},
  ${picture('hero')}
}
`;

export const getRelatedEvents = makeDataAccess(RELATED_EVENTS_QUERY);

export const lookupEvent = makeDataAccess(EVENT_DETAILS);
