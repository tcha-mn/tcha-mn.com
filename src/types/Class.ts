import type { Instructor } from './Instructor';

export type Class = {
  _id: string;
  _createdAt: Date;
  title: string;
  description: string;
  classType: string;
  ages: { min: number; max: number };
  spots: number;
  price: number;
  image: string;
  alt: string;
  instructors: Instructor[];
  classTimes: { _type: string; start: string; end: string };
};
