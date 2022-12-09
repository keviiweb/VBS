import React from 'react';
import { Box } from '@chakra-ui/react';

import Auth from '@components/sys/Auth';
import Announcement from '@components/sys/misc/Announcement';

/**
 * Entry page of the system
 *
 * This is the home page that is displayed to the user upon successful login
 *
 * @returns Home Page
 */
export default function Home () {
  return (
    <Auth admin={undefined}>
      <Box>
        <Box w='full' textAlign='center'>
          <Announcement />
        </Box>
      </Box>
    </Auth>
  );
}
