import Image from "next/image";
import { Box, Flex } from "@chakra-ui/react";

export default function VenueCard({ item }) {
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
        {item.image && (
          <Box
            w="100%"
            height="170px"
            position="relative"
            overflow="hidden"
            roundedTop="lg"
          >
            <Image
              src={item.image}
              objectFit="cover"
              alt="picture of a venue"
              layout="fill"
            />
          </Box>
        )}

        {!item.image && (
          <Box
            w="100%"
            height="170px"
            position="relative"
            overflow="hidden"
            roundedTop="lg"
          >
            <Image
              src="image/placeholder.png"
              objectFit="cover"
              alt="picture of a venue"
              layout="fill"
            />
          </Box>
        )}
        <Box p="6">
          <Box fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
            {item.name}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
