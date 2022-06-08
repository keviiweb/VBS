import React from 'react';
import Header from '@components/landing/Header';
import Social from '@components/landing/Social';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Social />
    </>
  );
}
