import type { PortableTextBlock } from '@portabletext/types';

export type Instructor = {
  _id: string;
  class_types: string[];
  name: string;
  headshot: string;
  bio: string;
  class_type_bio?: PortableTextBlock[];
};
