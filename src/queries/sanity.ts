import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageObject } from '@sanity/image-url/lib/types/types';
import SanityPicture, { picture, setSanityPictureDefaults } from 'astro-sanity-picture';
import { sanityClient } from 'sanity:client';
export type { PortableTextBlock } from '@portabletext/types';
import debug from 'debug';
import { DateTime } from 'luxon';

export interface StandardImageAsset {
  asset: {
    _id: string;
    metadata: {
      lqip: string;
      dimensions: {
        width: number;
        height: number;
      };
    };
  };
  alt?: string;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

const queryLogger = debug('site:sanity:query');
const resultsLogger = debug('site:sanity:results');

const builder = imageUrlBuilder(sanityClient);
setSanityPictureDefaults({ imageUrlBuilder: builder });

export interface BaseQueryOptions {
  picture: typeof picture;
}
export const urlFor = (source: SanityImageObject) => {
  return builder.image(source);
};

async function queryAndProcess<Result, PreProcessedResult>(
  query: string,
  preprocessor?: (result: PreProcessedResult) => Result
): Promise<Result> {
  queryLogger('Query: %s', query);
  const result = await sanityClient.fetch(query);
  const processedResults = preprocessor ? preprocessor(result as PreProcessedResult) : (result as Result);
  resultsLogger('Results: %j', processedResults);
  return processedResults;
}

export function makeDataAccess<Result, PreProcessedResult = never>(
  query: string | ((options: BaseQueryOptions) => string),
  preprocessor?: (result: PreProcessedResult) => Result
): () => Promise<Result> {
  return async (): Promise<Result> =>
    queryAndProcess(typeof query === 'function' ? query({ picture }) : query, preprocessor);
}

export function makeDynamicDataAccess<
  Result,
  Options extends BaseQueryOptions = BaseQueryOptions,
  PreProcessedResult = never,
>(
  query: (options: Options) => string,
  preprocessor?: (result: PreProcessedResult) => Result
): (options: Omit<Options, 'picture'>) => Promise<Result> {
  return async (options: Exclude<Options, BaseQueryOptions>): Promise<Result> => {
    const formedQuery = query({ ...options, picture });
    return queryAndProcess(formedQuery, preprocessor);
  };
}

const previewNow = process.env.PREVIEW_NOW?.match(/\d{4}-\d{2}-\d{2}/) ? process.env.PREVIEW_NOW : undefined;
export const nowDateTime = previewNow
  ? DateTime.fromISO(`${previewNow}T00:00:01`, { zone: 'America/Chicago' })
  : DateTime.now();
export const now = `dateTime("${nowDateTime.toUTC().toISO()}")`;

export const groqDateTimeFromDate = (fragment: string) => `dateTime(${fragment} + "T00:00:00Z")`;

export type { SanityImageObject };
export { SanityPicture };
