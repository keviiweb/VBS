import React from 'react';
import { Flex, Box, Stack, Heading, Text } from '@chakra-ui/react';

export default function Error() {
  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='lg' py={12} px={6}>
        <Box rounded='lg' align='center' bg='white' boxShadow='lg' p={8}>
          <Heading fontSize='4xl'>An error occured</Heading>
          <Text fontSize='sm' color='gray.600'>
            We are currently fixing the problem. Please give us time to
            troubleshoot :(
          </Text>
        </Box>
      </Stack>
    </Flex>
  );
}
