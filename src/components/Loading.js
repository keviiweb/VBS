import { Box, Stack, Text, Spinner } from "@chakra-ui/react";

export default function Loading({ message }) {
  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Box rounded={"lg"} bg="white" boxShadow={"lg"} p={8}>
        <Stack align={"center"}>
          <Text fontSize={"sm"} color={"gray.600"}>
            {message}
          </Text>
          <Spinner />
        </Stack>
      </Box>
    </Stack>
  );
}
