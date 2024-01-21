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
  preview_image: {
    _type: string;
    alt: string;
    asset: {
      _ref: string;
    };
  };
  instructors: Instructor[];
  classTimes: { _type: string; start: string; end: string };
  dates?: { day_of_week: string; start: string; end: string };
};
