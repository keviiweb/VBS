import React from 'react';
import Header from '@components/sys/misc/Header';
import Sidebar from '@components/sys/misc/Sidebar';

import { Box, Drawer, DrawerContent, useDisclosure } from '@chakra-ui/react';

/**
 * Default layout for the system-page.
 *
 * It consists of a Sidebar and a Header
 *
 * @param param0 React Children
 * @returns Layout for system
 */
export default function Layout ({ session, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH='100vh' bg='gray.100'>
      <Sidebar
        session={session}
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size='full'
      >
        <DrawerContent>
          <Sidebar session={session} onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* = Header = */}
      <Header onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p='4'>
        {children}
      </Box>
    </Box>
  );
}
