import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';

import { GetServerSideProps } from 'next';
import { checkerString } from '@constants/sys/helper';

/**
 * Renders a signin page
 *
 * @param props Host URL
 * @returns SignIn Page
 */
export default function SignIn(props: any) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const emailDB = useRef('');
  const [errorMsg, setError] = useState('');

  const [url, setURL] = useState('https://kevii.azurewebsites.net'); // default

  useEffect(() => {
    async function fetchData(propsField: any) {
      if (checkerString(propsField.data)) {
        setURL(propsField.data);
      }
    }
    fetchData(props);
  }, [url, props]);

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    if (checkerString(emailDB.current) && emailDB.current.includes('@')) {
      try {
        setError('');
        setLoading(true);
        await signIn('email', {
          email,
          callbackUrl: `${url}/sys`,
        });
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }
    setError('Please enter a valid email');
  };

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack spacing={8} mx='auto' maxW='lg' py={12} px={6}>
        <Stack align='center'>
          <Heading fontSize='4xl'>KEVII</Heading>
          <Text fontSize='sm' color='gray.600'>
            Please enter your school email ending with @u.nus.edu
          </Text>
        </Stack>

        {checkerString(errorMsg) && (
          <Stack align='center'>
            <Text>{errorMsg}</Text>
          </Stack>
        )}

        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id='email'>
                <FormLabel>Email address</FormLabel>
                <Input
                  type='email'
                  isDisabled={loading}
                  placeholder='test@u.nus.edu'
                  size='lg'
                  onChange={(event) => {
                    setEmail(event.currentTarget.value);
                    emailDB.current = event.currentTarget.value;
                  }}
                />
              </FormControl>
              <Stack spacing={10}>
                <Button
                  type='submit'
                  isDisabled={loading}
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </form>

          {loading && (
            <Stack spacing={10} mt={5}>
              <Stack align='center'>
                <Text fontSize='sm' color='gray.600'>
                  Logging in...
                </Text>
                <Spinner />
              </Stack>
            </Stack>
          )}
        </Box>
      </Stack>
    </Flex>
  );
}

export const getServerSideProps: GetServerSideProps = async (cont) => {
  cont.res.setHeader(
    'Cache-Control',
    'public, s-maxage=7200, stale-while-revalidate=100000',
  );

  const data: string | null =
    process.env.NEXTAUTH_URL !== undefined ? process.env.NEXTAUTH_URL : null;

  return {
    props: {
      data,
    },
  };
};
