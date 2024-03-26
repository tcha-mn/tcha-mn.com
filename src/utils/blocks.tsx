// Taken from: https://www.sanity.io/guides/portable-text-tailwind-prose-class
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from 'sanity';

//import SectionImage from './section-image'

type Props = {
  value: PortableTextBlock[]
}

export default function Blocks({ value }: Props) {
  let div: PortableTextBlock[] = []
  return value.map((block, i, blocks) => {
    // Normal text blocks (p, h1, h2, etc.) — these are grouped so we can wrap them in a prose div
    if (block._type === 'block') {
      div.push(block)

      // If the next block is also text, group it with this one
      if (blocks[i + 1]?._type === 'block') return null

      // Otherwise, render the group of text blocks we have
      const value = div
      div = []

      return (
        <div key={block._key} className="prose-lg prose-h2:leading-tighter prose-h2:text-heading prose-h2:mb-12 prose-h2:font-heading prose-h2:text-3xl prose-h2:font-bold prose-h2:tracking-tighter prose-h2:md:text-4xl prose-h3:font-bold prose-h4:font-bold prose-p:text-l prose-p:mb-6">
          <PortableText
            value={value}
            components={{
              marks: {
                // ...
              },
            }}
          />
        </div>
      )
    } else {
      // Non-text blocks (modules, sections, etc.) — note that these can recursively render text
      // blocks again
      return (
        <PortableText
          key={block._key}
          value={block}
          /*components={{
            types: {
              'section.image': ({ value }) => <SectionImage {...value} sanity={sanity} />,
              // ...
            },
          }}*/
        />
      )
    }
  })
}