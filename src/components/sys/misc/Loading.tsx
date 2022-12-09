import React from 'react';
import { Stack, Spinner, Text } from '@chakra-ui/react';

/**
 * Renders a simple component with a short message when the data is loading
 *
 * @param param0 A simple message
 * @returns A simple component that is rendered when loading
 */
export default function Loading({ message }) {
  return (
    <Stack spacing={8} mx='auto' maxW='lg' py={12} px={6}>
      <Stack align='center'>
        <Text fontSize='sm' color='gray.600'>
          {message}
        </Text>
        <Spinner />
      </Stack>
    </Stack>
  );
}
