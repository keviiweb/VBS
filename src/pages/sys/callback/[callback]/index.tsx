import React, { useCallback, useEffect, useRef } from 'react';
import { Box, Flex, Heading, Stack, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { CheckCircleIcon } from '@chakra-ui/icons';

/**
 * This component is vital in ensuring the passwordless authentication process works
 *
 * The component will automatically redirect the user to the callback link embedded within the query of the page.
 *
 * @returns A simple redirection component
 */
export default function EmailCallBack() {
  const router = useRouter();
  const { query } = router;
  const link = useRef('');

  const timeout = useCallback(async () => {
    if (
      query.email !== '' &&
      query.email !== null &&
      query.email !== undefined &&
      query.callbackUrl !== '' &&
      query.callbackUrl !== null &&
      query.callbackUrl !== undefined &&
      query.callback !== '' &&
      query.callback !== null &&
      query.callback !== undefined &&
      query.token !== '' &&
      query.token !== null &&
      query.token !== undefined &&
      link.current !== ''
    ) {
      await router.push(link.current);
    }
  }, [query.callback, query.callbackUrl, query.email, query.token, router]);

  const transferToAuth = useCallback(() => {
    if (
      query.email !== '' &&
      query.email !== null &&
      query.email !== undefined &&
      query.callbackUrl !== '' &&
      query.callbackUrl !== null &&
      query.callbackUrl !== undefined &&
      query.callback !== '' &&
      query.callback !== null &&
      query.callback !== undefined &&
      query.token !== '' &&
      query.token !== null &&
      query.token !== undefined
    ) {
      link.current = `/api/auth/callback/${query.callback}?callbackUrl=${query.callbackUrl}&token=${query.token}&email=${query.email}`;
      setTimeout(timeout, 6500);
    }
  }, [query.email, query.callbackUrl, query.callback, query.token, timeout]);

  useEffect(() => {
    transferToAuth();
  }, [query, transferToAuth]);

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='lg' py={12} px={6}>
        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <Box textAlign='center' py={10} px={6}>
            <CheckCircleIcon boxSize='50px' color='green.500' />
            <Heading as='h2' size='xl' mt={6} mb={2}>
              Login Successful
            </Heading>
            <Text color='gray.500'>Redirecting you in 10 seconds...</Text>
            <Text color='gray.500'>Please do not close this window</Text>
            <Spinner mt={5} />
          </Box>
        </Box>
      </Stack>
    </Flex>
  );
}
