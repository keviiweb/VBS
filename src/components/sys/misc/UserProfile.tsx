import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

/**
 * Renders a dropdown menu when the user clicks on the Avatar on the Header
 *
 * @param props Contains data such as the current host URL
 * @returns A component displaying the dropdown menu
 */
export default function UserProfile(props: any) {
  const [url, setURL] = useState('https://vbs-kevii.vercel.app'); // default
  const router = useRouter();

  useEffect(() => {
    async function fetchData(propsField: Promise<{ data: string }>) {
      const propRes = await propsField;
      try {
        if (propRes.data) {
          setURL(propRes.data);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchData(props);
  }, [url, props]);

  return (
    <HStack spacing={{ base: '0', md: '6' }}>
      <Flex alignItems='center'>
        <Menu>
          <MenuButton
            py={2}
            transition='all 0.3s'
            _focus={{ boxShadow: 'none' }}
          >
            <HStack spacing='4'>
              <Avatar
                size='md'
                src='https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png'
              />
              <Box display={{ base: 'none', md: 'flex' }}>
                <FiChevronDown />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList fontSize='lg' bg='white' borderColor='gray.200'>
            <MenuItem onClick={() => router.push('/sys/profile')}>
              Profile
            </MenuItem>
            <MenuDivider />
            <MenuItem
              onClick={() => signOut({ callbackUrl: `${url}/sys/signin` })}
            >
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </HStack>
  );
}

export async function getServerSideProps() {
  return {
    props: (async function Props() {
      try {
        return {
          data: process.env.NEXTAUTH_URL,
        };
      } catch (error) {
        console.error(error);
        return {
          data: null,
        };
      }
    })(),
  };
}
