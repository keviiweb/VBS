import React from 'react';
import Header from '@components/landing/Header';
import Social from '@components/landing/Social';
import ButtonScrollTop from '@components/landing/ButtonScroll';

/**
 * Default landing page layout with Header, content and Social-media buttons
 *
 * @param param0 React Children
 * @returns Layout page
 */
export default function Layout ({ children }) {
  return (
    <>
      <Header />
      {children}
      <Social />
      <ButtonScrollTop />
    </>
  );
}
