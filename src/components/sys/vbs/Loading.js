import { Box, Stack, Text, Spinner } from '@chakra-ui/react';

export default function Loading({ message }) {
  return (
    <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
      <Stack align={'center'}>
        <Text fontSize={'sm'} color={'gray.600'}>
          {message}
        </Text>
        <Spinner />
      </Stack>
    </Stack>
  );
}
