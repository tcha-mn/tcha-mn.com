export type Semester = {
  name: string;
  dates: {
    breaks: string[];
    start: string;
    end: string;
  };
  registration_open: string;
  early_registration_end: string;
};
