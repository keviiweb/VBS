import React from 'react';
import { IconButton, Flex, Text } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import UserProfile from '@components/sys/vbs/UserProfile';
import Link from 'next/link';

export default function Header({ session, onOpen, ...rest }) {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px='4'
      position='sticky'
      top='0'
      height='20'
      zIndex='10'
      alignItems='center'
      bg='white'
      borderBottomWidth='1px'
      borderBottomColor='gray.200'
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant='outline'
        aria-label='open menu'
        icon={<FiMenu />}
      />

      <Link href='/sys'>
        <Text
          display={{ base: 'flex', md: 'none' }}
          fontSize='2xl'
          fontFamily='monospace'
          fontWeight='bold'
        >
          KEVII
        </Text>
      </Link>
      <UserProfile session={session} />
    </Flex>
  );
}
