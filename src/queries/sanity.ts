import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from 'sanity:client';
export type { PortableTextBlock } from '@portabletext/types';
import debug from 'debug';
import { DateTime } from 'luxon';
import groq from 'groq';
import type { StandardImageAsset } from '../types';

const queryLogger = debug('site:sanity:query');
const resultsLogger = debug('site:sanity:results');
const picture = (attr: string, opts?: { as: string }) => groq`'${opts?.as ?? attr}': ${attr} {
  ...,
  asset->{
    _id,
    metadata {
      lqip,
      dimensions
    }
  }
}`;

const builder = imageUrlBuilder(sanityClient);

export interface BaseQueryOptions {
  picture: typeof picture;
}
export const urlFor = (source: StandardImageAsset) => {
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
): (options: Exclude<Options, BaseQueryOptions>) => Promise<Result> {
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
