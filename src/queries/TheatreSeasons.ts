import { parseDate, DateTime } from '~/utils/dates';
import {
  makeDataAccess,
  type BaseQueryOptions,
  type SanityImageSource,
  type PortableTextBlock,
  makeDynamicDataAccess,
} from './sanity';

interface TheatreSeasonRaw {
  title: string;
  slug: string;
  description: string;
  preview_date: string;
  date_visible: string;
}

export interface TheatreSeason extends Omit<TheatreSeasonRaw, 'preview_date' | 'date_visible'> {
  preview_date: DateTime;
  date_visible: DateTime;
  isVisible: boolean;
}

export interface TheatreSeasonSlugs {
  slug: string;
  shows: string[];
}
interface QueryOptions extends BaseQueryOptions {
  season: string;
}

const VISIBLE_THEATRE_SEASONS = `_type == "season" && (preview_date < now() || date_visible < now())`;
const THEATER_SEASON_FIELDS = 'title, "slug": slug.current, description, preview_date, date_visible';

const SEASON_LIST = `*[${VISIBLE_THEATRE_SEASONS}] | order(date_visible desc) { ${THEATER_SEASON_FIELDS} }`;
const SINGLE_SEASON = ({ season }: QueryOptions) =>
  `*[${VISIBLE_THEATRE_SEASONS} && slug.current == "${season}"] | order(date_visible desc) { ${THEATER_SEASON_FIELDS} }[0]`;

const SEASON_SHOW_SLUGS = `*[${VISIBLE_THEATRE_SEASONS}] | order(date_visible desc)
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
    }
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
    isVisible: date_visible < DateTime.now(),
  };
}

interface ShowRaw {
  _id: string;
  title: string;
  slug: string;
  hero: SanityImageSource;
  description: PortableTextBlock[];
  date_range: {
    start: string;
    end: string;
  };
  directors: {
    _id: string;
    name: string;
    bio: string;
    headshot: SanityImageSource;
  }[];
}
export interface Show extends Omit<ShowRaw, 'date_range'> {
  gallery: {
    images: SanityImageSource[];
  };
  date_range: {
    start: DateTime;
    end: DateTime;
  };
}

interface SeasonInfoRaw {
  season: TheatreSeasonRaw & { hero: SanityImageSource };
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
    images: SanityImageSource[];
  };
}

function processShowInfo(show: ShowRawDetailed): Show {
  return {
    ...show,
    date_range: {
      start: parseDate(show.date_range.start),
      end: parseDate(show.date_range.end),
    },
  };
}

export const fetchAll = makeDataAccess(SEASON_LIST, (seasons: TheatreSeasonRaw[]) => seasons.map(inflateSeasonDates));
export const fetchOne = makeDynamicDataAccess(SINGLE_SEASON, (season: TheatreSeasonRaw) => inflateSeasonDates(season));
export const fetchSlugs = makeDataAccess<TheatreSeasonSlugs[]>(SEASON_SHOW_SLUGS);
export const fetchSeasonInfo = makeDynamicDataAccess(SEASON_INFO, processSeasonInfo);
export const fetchShowInfo = makeDynamicDataAccess(SHOW_INFO, processShowInfo);
