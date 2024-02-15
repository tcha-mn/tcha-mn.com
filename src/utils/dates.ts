import { DateTime, Settings } from 'luxon';
export { DateTime };

Settings.throwOnInvalid = true;

declare module 'luxon' {
  interface TSSettings {
    throwOnInvalid: true;
  }
}

export function parseDate(date: string) {
  return DateTime.fromISO(date);
}
