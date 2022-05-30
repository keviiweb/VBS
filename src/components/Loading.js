import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";

export default function Loading({ message }) {
  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack align={"center"}>
            <Text fontSize={"sm"} color={"gray.600"}>
               {message}
            </Text>
            <Spinner />
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
