import React, { useEffect } from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

/**
 * Renders a component whenever user encountered error
 *
 * @returns Error Page
 */
export default function Error() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/sys');
    }, 5000);
  }, [router]);

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='lg' py={12} px={6} textAlign='center'>
        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <Stack align='center'>
            <Heading fontSize='4xl'>An error occured</Heading>
            <Text fontSize='sm' color='gray.600' mt={5}>
              We are currently fixing the problem.
            </Text>
            <Text fontSize='sm' color='gray.600' mt={-5}>
              Please give us time to troubleshoot :(
            </Text>
            <Text mt={4} fontSize='sm' color='gray.600'>
              Redirecting you to main page in 5 seconds...
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
