import { groqDateTimeFromDate, makeDataAccess, now } from './sanity';

export interface Announcement {
  badge: string;
  headline: string;
  link: {
    text: string;
    href: string;
    new_window: boolean;
  };
}

const ANNOUNCEMENT_QUERY = `*[
  _type == "announcement"
&& ${groqDateTimeFromDate('effective_dates.start')} < ${now}
&& ${groqDateTimeFromDate('effective_dates.end')} > ${now}
] | order(effective_dates.start desc) [0] {
  badge, headline, link
}`;

export const getCurrentAnnouncement = makeDataAccess<Announcement>(ANNOUNCEMENT_QUERY);
