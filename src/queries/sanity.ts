import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import SanityPicture, { picture, setSanityPictureDefaults } from 'astro-sanity-picture';
import { sanityClient } from 'sanity:client';
export type { PortableTextBlock } from '@portabletext/types';
import debug from 'debug';

const logger = debug('site:sanity');

const builder = imageUrlBuilder(sanityClient);
setSanityPictureDefaults({ imageUrlBuilder: builder });

export interface BaseQueryOptions {
  picture: typeof picture;
}
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

async function queryAndProcess<Result, PreProcessedResult>(
  query: string,
  preprocessor?: (result: PreProcessedResult) => Result
): Promise<Result> {
  logger('Query: %s', query);
  const result = await sanityClient.fetch(query);
  const processedResults = preprocessor ? preprocessor(result as PreProcessedResult) : (result as Result);
  logger('Results: %j', processedResults);
  return processedResults;
}

export function makeDataAccess<Result, PreProcessedResult = never>(
  query: string,
  preprocessor?: (result: PreProcessedResult) => Result
): () => Promise<Result> {
  return async (): Promise<Result> => queryAndProcess(query, preprocessor);
}

type ReturnType<Opt, Result> = BaseQueryOptions extends Opt
  ? () => Promise<Result>
  : (options: Omit<Opt, 'picture'>) => Promise<Result>;

export function makeDynamicDataAccess<
  Result,
  Options extends BaseQueryOptions = BaseQueryOptions,
  PreProcessedResult = never,
>(
  query: (options: Options) => string,
  preprocessor?: (result: PreProcessedResult) => Result
): ReturnType<Options, Result> {
  return async (options = {}): Promise<Result> => {
    // @ts-expect-error I can't get this typed correctly...
    const formedQuery = query({ ...options, picture });
    return queryAndProcess(formedQuery, preprocessor);
  };
}

export type { SanityImageSource };
export { SanityPicture };
