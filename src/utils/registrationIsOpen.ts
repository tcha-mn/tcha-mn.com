import { getCurrentSemester } from '~/queries/Semester';

export const getRegistrationStatus = async (): Promise<boolean> => {
  const currentSemester = await getCurrentSemester();
  return currentSemester != null;
};
