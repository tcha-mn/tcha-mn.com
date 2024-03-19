import type { PortableTextBlock } from '@portabletext/types';

export interface Instructor {
  _id: string;
  class_types: string[];
  name: string;
  headshot: string;
  bio: PortableTextBlock[];
}
