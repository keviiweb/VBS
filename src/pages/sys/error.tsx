import React from 'react';
import { Flex, Box, Stack, Heading, Text } from '@chakra-ui/react';

export default function Error() {
  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='lg' py={12} px={6}>
        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <Stack align='center'>
            <Heading fontSize='4xl'>An error occured</Heading>
            <Text fontSize='sm' color='gray.600' mt={5}>
              We are currently fixing the problem.
            </Text>
            <Text fontSize='sm' color='gray.600' mt={-5}>
              Please give us time to troubleshoot :(
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
