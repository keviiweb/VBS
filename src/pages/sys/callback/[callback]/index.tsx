import React, { useCallback, useEffect, useRef } from 'react';
import { Flex, Box, Stack, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { CheckCircleIcon } from '@chakra-ui/icons';

export default function EmailCallBack() {
  const router = useRouter();
  const { query } = router;
  const link = useRef('');

  const timeout = useCallback(() => {
    if (
      query.email &&
      query.callbackUrl &&
      query.callback &&
      query.token &&
      link.current
    ) {
      router.push(link.current);
    }
  }, [query.callback, query.callbackUrl, query.email, query.token, router]);

  const transferToAuth = useCallback(() => {
    if (query.email && query.callbackUrl && query.callback && query.token) {
      link.current = `/api/auth/callback/${query.callback}?callbackUrl=${query.callbackUrl}&token=${query.token}&email=${query.email}`;
      setTimeout(timeout, 9000);
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
              Login successful!
            </Heading>
            <Text color='gray.500'>Redirecting you in 10 seconds...</Text>
          </Box>
        </Box>
      </Stack>
    </Flex>
  );
}
