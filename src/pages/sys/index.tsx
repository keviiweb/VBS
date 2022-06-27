import React from 'react';
import { Box } from '@chakra-ui/react';

import Auth from '@components/sys/Auth';
import Announcement from '@components/sys/misc/Announcement';

export default function Home() {
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
