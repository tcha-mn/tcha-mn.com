import type { Instructor } from './Instructor';
import type { ClassType } from './ClassType';

export type Class = {
  _id: string;
  _createdAt: Date;
  title: string;
  description: string;
  classType: ClassType;
  ages: { min: number; max: number };
  spots: number;
  price: number;
  image: string;
  alt: string;
  instructors: Instructor[];
  classTimes: { _type: string; start: string; end: string };
};
