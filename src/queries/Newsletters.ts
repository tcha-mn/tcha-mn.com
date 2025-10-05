import type { PortableTextBlock } from 'sanity';
import { groqDateTimeFromDate, makeDataAccess, now, type BaseQueryOptions } from './sanity';
import type { StandardImageAsset } from '~/types';

export interface Newsletter {
  _id: string;
  issue: string;
  headline: string;
  hero?: StandardImageAsset;
  slug: {
    current: string;
  };
  date_visible: string;
  description: PortableTextBlock[];
  file?: {
    asset: {
      url: string;
    };
  };
}

const NEWSLETTERS_QUERY = ({
  picture,
}: BaseQueryOptions) => `*[_type == "newsletter" && ${groqDateTimeFromDate('date_visible')} <= ${now}] | order(date_visible desc) {
  _id,
  issue,
  headline,
  ${picture('hero')},
  slug,
  date_visible,
  description,
  file{
    asset->{
      url
    }
  }
}`;

export const fetchAllNewsletters = makeDataAccess<Newsletter[]>(NEWSLETTERS_QUERY);
