import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from '@chakra-ui/react';
import { BsPerson } from 'react-icons/bs';
import { MdOutlineEmail } from 'react-icons/md';

import Auth from '@components/sys/Auth';
import Loading from '@components/sys/misc/Loading';

import { currentSession } from '@helper/sys/session';
import { checkerString } from '@constants/sys/helper';

/**
 * Renders a profile page for the user to check their name and email
 *
 * @returns Profile Page
 */
export default function Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const session = await currentSession();
      const usernameField: string =
        session != null && checkerString(session.user.username)
          ? session.user.username
          : '';
      const emailField: string =
        session != null && checkerString(session.user.email)
          ? session.user.email
          : '';

      setUsername(usernameField);
      setEmail(emailField);

      setLoading(true);
    }

    fetchData();
  }, []);

  return (
    <Auth admin={undefined}>
      {loading && (
        <Flex bg='gray.100' align='center' justify='center' id='profile'>
          <Box
            borderRadius='lg'
            m={{ base: 5, md: 5, lg: 5 }}
            p={{ base: 5, lg: 7 }}
          >
            <Box>
              <VStack spacing={{ base: 4, md: 8, lg: 10 }}>
                <Heading
                  fontSize={{
                    base: '4xl',
                    md: '5xl',
                  }}
                >
                  Profile
                </Heading>

                <Box
                  bg='white'
                  borderRadius='lg'
                  p={8}
                  color='gray.700'
                  shadow='base'
                >
                  <VStack spacing={5}>
                    {checkerString(username) && (
                      <FormControl isDisabled>
                        <FormLabel>Name</FormLabel>

                        <InputGroup>
                          <InputLeftElement>
                            <BsPerson />
                          </InputLeftElement>
                          <Input
                            type='text'
                            name='name'
                            placeholder='Your Name'
                            value={username}
                          />
                        </InputGroup>
                      </FormControl>
                    )}

                    {checkerString(email) && (
                      <FormControl isDisabled>
                        <FormLabel>Email</FormLabel>

                        <InputGroup>
                          <InputLeftElement>
                            <MdOutlineEmail />
                          </InputLeftElement>
                          <Input
                            type='email'
                            name='email'
                            placeholder='Your Email'
                            value={email}
                          />
                        </InputGroup>
                      </FormControl>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>
      )}
      {!loading && (
        <Box>
          <Loading message='Loading profile...' />
        </Box>
      )}
    </Auth>
  );
}
