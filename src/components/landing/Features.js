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
      bg="#F9FAFB"
      p={20}
      w="auto"
      justifyContent="center"
      alignItems="center"
    >
      <Box py={12} rounded="xl">
        <Box maxW="7xl" mx="auto" px={{ base: 4, lg: 8 }}>
          <Box textAlign={"center"}>
            <chakra.p
              mt={2}
              fontSize={{ base: "2xl", sm: "3xl", lg: "4xl" }}
              lineHeight="8"
              fontWeight="extrabold"
              letterSpacing="tight"
              color="gray.900"
            >
              Explore King Edward VII Hall
            </chakra.p>
          </Box>

          <Box mt={10} alignContent="center">
            <Box w={700}>
              <Map
                location={location}
                zoomLevel={18}
                apiKey="AIzaSyCoiMvqTY6CAobxafxPCDPF5WmVh3ajlAQ"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
