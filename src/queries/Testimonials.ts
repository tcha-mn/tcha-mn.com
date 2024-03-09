import { makeDataAccess } from './sanity';

export interface Testimonial {
  name: string;
  relationship: string;
  testimonial: string;
  initials: string;
  image: never;
}
const QUERY = '*[_type == "testimonial"] | order(orderRank)';

function injectInitials(testimonials: Testimonial[]) {
  return testimonials.map((testimonial) => {
    const initials = testimonial.name
      .split(' ')
      .map((word) => word[0])
      .join('');
    return { ...testimonial, initials };
  });
}
export const fetchAll = makeDataAccess<Testimonial[]>(QUERY, injectInitials);
