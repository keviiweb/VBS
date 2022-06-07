import React from "react";
import { chakra, Box, Flex, SimpleGrid, Image } from "@chakra-ui/react";

export default function Video() {
  return (
    <Flex
      bg="#F9FAFB"
      p={20}
      w="auto"
      justifyContent="center"
      alignItems="center"
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={0}>
        <Flex>
          <video width={"full"} height={"110vh"} controls>
            <source src="https://nus.edu.sg/osa/videos/default-source/kevii-videos/qna-final.mp4?sfvrsn=ccaa662d_2" type="video/mp4" />
            Any alternate text.
          </video>
        </Flex>
        <Flex
          direction="column"
          alignItems="start"
          justifyContent="center"
          px={{ base: 4, md: 8, lg: 20 }}
          py={24}
          zIndex={3}
        >
          <chakra.h1
            mb={4}
            fontSize={{ base: "4xl", md: "4xl", lg: "5xl" }}
            fontWeight="bold"
            color="brand.600"
            lineHeight="shorter"
            textShadow="2px 0 currentcolor"
          >
            Learn more about us!
          </chakra.h1>
          <chakra.p
            pr={{ base: 0, lg: 16 }}
            mb={4}
            fontSize="lg"
            color="brand.600"
            letterSpacing="wider"
          >
            A peek into the engaging hall activities that makes the KE
            experience fulfilling! Catch a glimpse of the vibrancy KE has to
            offer and hear what our residents have to say through this video
            curated just for you!
          </chakra.p>
        </Flex>
      </SimpleGrid>
    </Flex>
  );
}
