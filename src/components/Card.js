import { Box, Flex } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";

export default function Card({ product }) {
  const { img, title, link } = product;

  return (
    <Link href={link}>
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
          <Image
            src={img}
            objectFit="cover"
            alt="image"
            layout="fill"
          />
        </Box>

        <Box p="6">
          <Box fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
            {title}
          </Box>
        </Box>
      </Box>
    </Flex>
    </Link>
  );
}
