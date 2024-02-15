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

export function makeDataAccess<Result, PreProcessedResult = never>(
  query: string,
  preprocessor?: (result: PreProcessedResult) => Result
): () => Promise<Result>;
export function makeDataAccess<Result, Options extends BaseQueryOptions = BaseQueryOptions, PreProcessedResult = never>(
  query: (options: Options) => string,
  preprocessor?: (result: PreProcessedResult) => Result
): (options: Omit<Options, 'picture'>) => Promise<Result>;

export function makeDataAccess<Result, Options extends BaseQueryOptions = BaseQueryOptions, PreProcessedResult = never>(
  query: string | ((options: Options) => string),
  preprocessor?: (result: PreProcessedResult) => Result
): (() => Promise<Result>) | ((options: Omit<Options, 'picture'>) => Promise<Result>) {
  return async (options: Options): Promise<Result> => {
    const formedQuery = typeof query === 'string' ? query : query({ ...options, picture });
    logger('Query: %s', formedQuery);
    const result = await sanityClient.fetch<Result>(formedQuery);
    const processedResults = preprocessor ? preprocessor(result) : result;
    logger('Results: %o', processedResults);
    return processedResults;
  };
}

export { SanityPicture };
