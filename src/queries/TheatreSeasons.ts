import { parseDate, DateTime } from '~/utils/dates';
import { makeDataAccess } from './sanity';

export interface TheatreSeason {
  title: string;
  preview_date: DateTime;
  date_visible: DateTime;
  isVisible: boolean;
}

interface TheatreSeasonRaw {
  title: string;
  preview_date: string;
  date_visible: string;
}

const QUERY = `*[_type == "season" && (preview_date < now() || date_visible < now())]
    | order(date_visible desc)
    { title, preview_date, date_visible }
`;

function inflateDates(season: TheatreSeasonRaw): TheatreSeason {
  const date_visible = parseDate(season.date_visible);
  return {
    ...season,
    preview_date: parseDate(season.preview_date),
    date_visible,
    isVisible: date_visible < DateTime.now(),
  };
}

export const fetchAll = makeDataAccess(QUERY, (seasons: TheatreSeasonRaw[]) => seasons.map(inflateDates));
