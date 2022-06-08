import {
  Box,
  Stack,
  Flex,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";

export default function Hero() {
  return (
    <Flex w={"full"} h={"110vh"}>
      <Box>
        <video autoPlay muted loop id="myVideo">
          <source
            src="https://nus.edu.sg/osa/videos/default-source/kevii-videos/promo-final-2.mp4?sfvrsn=2ad1ed6f_0"
            type="video/mp4"
          />
          Any alternate text.
        </video>
      </Box>
      <VStack
        w={"full"}
        justify={"center"}
        px={useBreakpointValue({ base: 4, md: 8 })}
        bgGradient={"linear(to-r, blackAlpha.600, transparent)"}
      >
        <Stack maxW={"2xl"} align={"flex-start"} spacing={6}>
          <Text
            color={"white"}
            fontWeight={700}
            lineHeight={1.2}
            fontSize={useBreakpointValue({ base: "4xl", md: "5xl" })}
          >
            To Strive, To Seek, To Serve
          </Text>
        </Stack>
      </VStack>
    </Flex>
  );
}
