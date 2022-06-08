import { chakra, Box, Flex, Stack } from "@chakra-ui/react";
import Map from "@components/landing/Map";

export default function Feature() {
  const location = {
    address: "1A Kent Ridge Rd, Singapore 119224",
    lat: 1.2913725,
    lng: 103.7792766,
  };

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justifyContent="center"
      alignItems="center"
      bg="#F9FAFB"
      px={16}
      py={24}
      mx="auto"
    >
      <Box
        w={{ base: "full", md: 11 / 12, xl: 9 / 12 }}
        mx="auto"
        pr={{ md: 20 }}
      >
        <chakra.h2
          fontSize={{ base: "3xl", sm: "4xl" }}
          fontWeight="extrabold"
          lineHeight="shorter"
          color="brand.600"
          mb={6}
        >
          <chakra.span display="block">
            Experience the life of a KEVIIAN
          </chakra.span>
        </chakra.h2>
        <chakra.p
          pr={{ base: 0, lg: 16 }}
          mb={4}
          fontSize="lg"
          color="brand.600"
          letterSpacing="wider"
        >
          Applications will be open on 16 May 2022 until 6 June 2022. Do visit
          the NUS OSA website for more details on the application process. Do
          also follow us on our socials to receive timely updates about the
          Hall, reminders and other important information!
        </chakra.p>
        <Stack
          direction={{ base: "column", sm: "row" }}
          mb={{ base: 4, md: 8 }}
          spacing={2}
        >
          <Box display="inline-flex" rounded="md" shadow="md">
            <chakra.a
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              px={5}
              py={3}
              border="solid transparent"
              fontWeight="bold"
              w="full"
              rounded="md"
              color="white"
              bg="gray.600"
              _hover={{
                bg: "teal.700",
              }}
              href="https://nus.edu.sg/osa/student-services/hostel-admission/undergraduate/application-dates"
            >
              Hall Application
            </chakra.a>
          </Box>
        </Stack>
      </Box>
      <Box w={{ base: "full", md: 7 / 12 }} mx="auto" textAlign="center">
        <Box>
          <Map
            location={location}
            zoomLevel={18}
            apiKey={"AIzaSyCoiMvqTY6CAobxafxPCDPF5WmVh3ajlAQ"}
          />
        </Box>
      </Box>
    </Flex>
  );
}
