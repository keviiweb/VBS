import { cardVariant, parentVariant } from "@root/motion";
import { motion } from "framer-motion";
import { LinkBox, SimpleGrid, Box } from "@chakra-ui/react";
import Auth from "@components/Auth";
import Card from "@components/Card";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(LinkBox);

export default function Home() {
  return (
    <Auth>
      <Box>
        <MotionSimpleGrid
          mt="4"
          minChildWidth="250px"
          spacing="2em"
          minH="full"
          variants={parentVariant}
          initial="initial"
          animate="animate"
        >
          <MotionBox variants={cardVariant} key="1">
            <Card product={{ img: "", title: "VBS" }} href="/vbs" />
          </MotionBox>
          <MotionBox variants={cardVariant} key="2">
            <Card product={{ img: "", title: "CCA" }} href="/vcca" />
          </MotionBox>
        </MotionSimpleGrid>
      </Box>
    </Auth>
  );
}
