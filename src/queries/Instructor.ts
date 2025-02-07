import type { PortableTextBlock } from '@portabletext/types';
import type { BaseQueryOptions } from './sanity';
import type { StandardImageAsset } from '../types';

export interface Instructor {
  _id: string;
  name: string;
  headshot: StandardImageAsset;
  class_types: string[];
  bio: PortableTextBlock[];
}

export const INSTRUCTOR_QUERY_FRAGMENT = ({ picture }: BaseQueryOptions) => `{
  _id,
  name,
  ${picture('headshot')},
  class_types,
  "bio": coalesce(class_type_bio[class_type == ^.^.class_type][0].bio, bio)
}`;
