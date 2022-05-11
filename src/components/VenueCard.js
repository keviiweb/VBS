import Image from "next/image";
import { Box, Flex } from "@chakra-ui/react";

export default function VenueCard({ product, setModalData }) {
  const image = product.image ? product.image : "/image/placeholder.png";
  const name = product.name ? product.name : "Venue";
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
      onClick={() => setModalData(product)}
    >
      <Box w="full" h="full">
        <Box
          w="100%"
          height="13vw"
          position="relative"
          overflow="hidden"
          roundedTop="lg"
        >
          <Image
            src={image}
            objectFit="cover"
            alt="picture of a venue"
            layout="fill"
          />
        </Box>

        <Box p="6">
          <Box fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
            {name}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
