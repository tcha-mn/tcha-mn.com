import type { Instructor } from './Instructor';

export type Class = {
  _id: string;
  _createdAt: Date;
  title: string;
  description: string;
  classType: string;
  spots: number;
  ageMin: number;
  ageMax: number;
  price: number;
  image: string;
  alt: string;
  instructors: Instructor[];
};
