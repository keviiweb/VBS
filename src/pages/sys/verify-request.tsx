import React from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';

export default function VerifyRequest() {
  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='lg' py={12} px={6}>
        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <Stack align='center' textAlign='center'>
            <Heading fontSize='4xl'>Authentication</Heading>
            <Text fontSize='sm' color='gray.600' mt={10}>
              An email has been sent to you!
            </Text>
            <Text fontSize='sm' color='gray.600' mt={5}>
              Please click on the link in the email to complete your
              authentication.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
