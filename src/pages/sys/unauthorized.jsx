import {
  Flex, Box, Stack, Heading, Text,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Unauthorized() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 5000);
  }, [router]);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack mx="auto" maxW="lg" py={12} px={6}>
        <Box rounded="lg" align="center" bg="white" boxShadow="lg" p={8}>
          <Heading fontSize="4xl">Unauthorized user</Heading>
          <Text fontSize="sm" color="gray.600">
            You are unauthorized to visit the target page.
          </Text>
          <Text mt={4} fontSize="sm" color="gray.600">
            Redirecting you to main page in 5 seconds...
          </Text>
        </Box>
      </Stack>
    </Flex>
  );
}
