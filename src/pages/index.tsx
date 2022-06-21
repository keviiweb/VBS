import React from 'react';
import Landing from '@layout/landing';
import Hero from '@components/landing/Hero';
import Feature from '@components/landing/Features';
import Video from '@components/landing/Video';
import Carousel from '@components/landing/Carousel';

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

export async function getServerSideProps() {
  return {
    props: { API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY },
  };
}
