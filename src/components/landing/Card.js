import React from "react";
import { chakra, Box, Flex, Link, Image } from "@chakra-ui/react";

export default function Card({ title, description, img }) {
  return (
    <Flex p={50} w="full" alignItems="center" justifyContent="center">
      <Box mx="auto" rounded="lg" shadow="md" bg="white" maxW="2xl">
        {img && <Image w="full" h={64} fit="cover" src={img} alt="Event" />}

        <Box p={6}>
          <Box>
            <Link
              display="block"
              color="gray.800"
              fontWeight="bold"
              fontSize="2xl"
              mt={2}
              _hover={{ color: "gray.600", textDecor: "underline" }}
            >
              {title}
            </Link>
            <chakra.p mt={2} fontSize="sm" color="gray.600">
              {description}
            </chakra.p>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
