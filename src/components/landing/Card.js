import React from "react";
import { Box, Flex, Link, Image, Text, Button } from "@chakra-ui/react";
import NextLink from "next/link";

export default function Card({
  title,
  description,
  img,
  buttonText,
  buttonLink,
  link,
}) {
  const SubCard = () => (
    <NextLink href={link ? link : "#"} passHref>
      <Link
        display="block"
        mt={2}
        _hover={{ color: "gray.600", textDecor: "none" }}
      >
        <Box mx="auto" rounded="lg" shadow="lg" maxW="2xl">
          {img && <Image w="full" fit="cover" src={img} alt="Event" />}
          <Box p={6}>
            <Box>
              <Text fontWeight={"bold"} fontSize="2xl">
                {title}
              </Text>

              <Text
                style={{ whiteSpace: "pre-line" }}
                mt={2}
                fontSize="sm"
                color="gray.600"
              >
                {description}
              </Text>
            </Box>

            {buttonLink && buttonText && (
              <NextLink href={buttonLink} passHref>
                <Link isExternal>
                  <Button mt={10}>{buttonText}</Button>
                </Link>{" "}
              </NextLink>
            )}
          </Box>
        </Box>
      </Link>
    </NextLink>
  );

  return (
    <Flex p={50} w="full" alignItems="center" justifyContent="center">
      <SubCard />
    </Flex>
  );
}
