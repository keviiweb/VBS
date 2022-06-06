import { cardVariant, parentVariant } from "@root/motion";
import { motion } from "framer-motion";
import { Box, SimpleGrid, Text} from "@chakra-ui/react";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function Index() {
  return (

      <Box>
        <MotionSimpleGrid
          mt="3"
          minChildWidth={{ base: "full", md: "500px", lg: "500px" }}
          spacing="2em"
          minH="full"
          variants={parentVariant}
          initial="initial"
          animate="animate"
        >
        <Text>Future landing page!</Text>

        </MotionSimpleGrid>
      </Box>

  );
}
