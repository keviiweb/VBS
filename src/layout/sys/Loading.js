import { Box, Flex, Stack, Heading, Text, Spinner } from '@chakra-ui/react';
import React from 'react';

export default function Loading() {
  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg='gray.50'>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Box rounded={'lg'} bg='white' boxShadow={'lg'} p={8}>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'}>KEVII VBS</Heading>
            <Text fontSize={'sm'} color={'gray.600'}>
              Loading webpage... Please give it a moment
            </Text>
            <Spinner />
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
