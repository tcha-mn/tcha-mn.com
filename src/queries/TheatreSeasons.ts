import { parseDate, DateTime } from '~/utils/dates';
import {
  makeDataAccess,
  now,
  type BaseQueryOptions,
  type SanityImageObject,
  type PortableTextBlock,
  makeDynamicDataAccess,
} from './sanity';

interface TheatreSeasonRaw {
  title: string;
  slug: string;
  description: PortableTextBlock[];
  preview_date: string;
  date_visible: string;
  isVisible: boolean;
}

export interface TheatreSeason extends Omit<TheatreSeasonRaw, 'preview_date' | 'date_visible'> {
  preview_date: DateTime;
  date_visible: DateTime;
}

export interface TheatreSeasonSlugs {
  slug: string;
  shows: string[];
}
interface QueryOptions extends BaseQueryOptions {
  season: string;
}

const VISIBLE_THEATRE_SEASONS = `_type == "season" && (preview_date < ${now} || date_visible < ${now})`;
const THEATER_SEASON_FIELDS = `title, "slug": slug.current, description, preview_date, date_visible, "isVisible": date_visible < ${now}`;

const SEASON_LIST = `*[${VISIBLE_THEATRE_SEASONS}] | order(date_visible desc) { ${THEATER_SEASON_FIELDS} }`;
const SINGLE_SEASON = ({ season }: QueryOptions) =>
  `*[${VISIBLE_THEATRE_SEASONS} && slug.current == "${season}"] | order(date_visible desc) { ${THEATER_SEASON_FIELDS} }[0]`;

const SEASON_SHOW_SLUGS = `*[${VISIBLE_THEATRE_SEASONS} && date_visible < ${now}] | order(date_visible desc)
    { "slug": slug.current, "shows": *[_type == "show" && references(^._id)].slug.current }`;

const SHOW_FIELDS = ({ picture }: BaseQueryOptions) => `_id,
    title,
    ${picture('hero')},
    description,
    date_range,
    "slug": slug.current,
    "directors": directors[]->{
      _id,
      name,
      "bio": coalesce(class_type_bio[class_type == "theatre"][0].bio, bio),
      ${picture('headshot')}
    },
    "participation_is_open": participation.deadline > now(),
    participation
`;
const SEASON_INFO = ({ season, picture }: QueryOptions) => `
*[${VISIBLE_THEATRE_SEASONS} && title == "${season}"] {
  "season": {${THEATER_SEASON_FIELDS}, ${picture('hero')}},
  "shows": *[_type == "show" && references(^._id)] | order(date_range.start) {
    ${SHOW_FIELDS({ picture })} 
  }
}[0]`;

interface ShowQueryOptions extends BaseQueryOptions {
  slug: string;
}

const SHOW_INFO = ({ slug, picture }: ShowQueryOptions) => `
*[_type == "show" && slug.current == "${slug}" ] | order(date_range.start) {
  ${SHOW_FIELDS({ picture })}, 
  "gallery": { ${picture('images.images[]', { as: 'images' })} }
}[0]
`;

function inflateSeasonDates(season: TheatreSeasonRaw): TheatreSeason {
  const date_visible = parseDate(season.date_visible);
  return {
    ...season,
    preview_date: parseDate(season.preview_date),
    date_visible,
  };
}

interface ShowRaw {
  _id: string;
  title: string;
  slug: string;
  hero: SanityImageObject;
  description: PortableTextBlock[];
  date_range: {
    start: string;
    end: string;
  };
  directors: {
    _id: string;
    name: string;
    bio: string;
    headshot: SanityImageObject;
  }[];
  participation_is_open: boolean;
  participation?: {
    deadline: string;
    registration_link: string;
    details: PortableTextBlock[];
  }
}
export interface Show extends Omit<ShowRaw, 'date_range' | 'participation'> {
  gallery: {
    images: SanityImageObject[];
  };
  date_range: {
    start: DateTime;
    end: DateTime;
  };
  participation?: {
    deadline: DateTime;
    registration_link: string;
    details: PortableTextBlock[];
  }
}

interface SeasonInfoRaw {
  season: TheatreSeasonRaw & { hero: SanityImageObject };
  shows: ShowRaw[];
}

function processSeasonInfo(info: SeasonInfoRaw) {
  return {
    season: {
      ...inflateSeasonDates(info.season),
      hero: info.season.hero,
    },
    shows: info.shows.map(processShowInfo),
  };
}

interface ShowRawDetailed extends ShowRaw {
  gallery: {
    images: SanityImageObject[];
  };
}

function processShowInfo(show: ShowRawDetailed): Show {
  const participationDeadline = show.participation_is_open && show.participation ? parseDate(show.participation.deadline) : DateTime.now();
  return {
    ...show,
    date_range: {
      start: parseDate(show.date_range.start),
      end: parseDate(show.date_range.end),
    },
    participation: show.participation && {
      deadline: participationDeadline,
      registration_link: show.participation.registration_link,
      details: show.participation.details,
    },
  };
}

export const fetchAll = makeDataAccess(SEASON_LIST, (seasons: TheatreSeasonRaw[]) => seasons.map(inflateSeasonDates));
export const fetchOne = makeDynamicDataAccess(SINGLE_SEASON, (season: TheatreSeasonRaw) => inflateSeasonDates(season));
export const fetchSlugs = makeDataAccess<TheatreSeasonSlugs[]>(SEASON_SHOW_SLUGS);
export const fetchSeasonInfo = makeDynamicDataAccess(SEASON_INFO, processSeasonInfo);
export const fetchShowInfo = makeDynamicDataAccess(SHOW_INFO, processShowInfo);
