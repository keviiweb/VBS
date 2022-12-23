import React from 'react';
import Landing from '@layout/landing';
import Hero from '@components/landing/Hero';
import Feature from '@components/landing/Features';
import Video from '@components/landing/Video';
import Carousel from '@components/landing/Carousel';

import { GetServerSideProps } from 'next';

/**
 * Renders the main landing page.
 *
 * The order of the components can be adjusted through here
 *
 * @param param0 API Key for Google Maps
 * @returns Main landing page
 */
export default function Index({ API_KEY }) {
  return (
    <Landing>
      <Hero />
      <Video />
      <Feature API_KEY={API_KEY} />
      <Carousel />
    </Landing>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({
  props: {
    API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY !== null &&
      process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY !== undefined
        ? process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY.trim()
        : null,
  },
});
