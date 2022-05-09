import { Box, Flex, Text, Image } from "@chakra-ui/react";

export default function Card({ product }) {
  const { img, title } = product;

  return (
    <Flex
      w="full"
      h="full"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      bg="white"
      rounded="xl"
      shadow="lg"
      borderWidth="1px"
    >
      <Box w="full" h="full">
        <Box
          w="100%"
          height="200px"
          position="relative"
          overflow="hidden"
          roundedTop="lg"
        >
          {img && (
            <Image objectFit="contain" src={img} alt="Image" />
          )}

          {title && (
            <Box fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
              <Text z-index="100">{title}</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Flex>
  );
}
