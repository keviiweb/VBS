import Header from '@components/landing/Header';
import Social from '@components/landing/Social';
import React from 'react';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Social />
    </>
  );
}
