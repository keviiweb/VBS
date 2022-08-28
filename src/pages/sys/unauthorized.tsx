import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';

/**
 * Renders a component whenever user has the incorrect permissions and tried to access an admin-level page
 *
 * @returns Unauthorized Page
 */
export default function Unauthorized() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      if (router.isReady) {
        router.push('/sys');
      }
    }, 200);
  }, [router, router.isReady]);

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50' />
  );
}
