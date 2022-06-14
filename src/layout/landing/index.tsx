import React from 'react';
import Header from '@components/landing/Header';
import Social from '@components/landing/Social';
import ButtonScrollTop from '@components/landing/ButtonScroll';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Social />
      <ButtonScrollTop />
    </>
  );
}
