import React from 'react';
import { Flex, Box, Stack, Heading, Text } from '@chakra-ui/react';

export default function VerifyRequest() {
  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='lg' py={12} px={6}>
        <Box rounded='lg' align='center' bg='white' boxShadow='lg' p={8}>
          <Heading fontSize='4xl'>Authentication</Heading>
          <Text fontSize='sm' color='gray.600' mt={10}>
            An email has been sent to you! Please click on the link in the email to complete your authentication.
          </Text>
        </Box>
      </Stack>
    </Flex>
  );
}
