import React, { useEffect } from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function Error404() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 5000);
  }, [router]);

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='lg' py={12} px={6}>
        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <Stack align='center'>
            <Heading fontSize='4xl'>Page not found</Heading>
            <Text fontSize='sm' color='gray.600' mt={5}>
              Have you gone to the wrong page?
            </Text>
            <Text fontSize='sm' color='gray.600' mt={-5}>
              Redirecting you to the homepage in 5 seconds...
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
