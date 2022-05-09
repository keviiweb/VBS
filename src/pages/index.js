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
          mt="3"
          minChildWidth="250px"
          spacing="2em"
          minH="full"
          variants={parentVariant}
          initial="initial"
          animate="animate"
        >
          <MotionBox variants={cardVariant} key="1">
            <Card
              product={{
                img: "/image/vbs.png",
                title: "Book a Venue",
                link: "/vbs",
              }}
            />
          </MotionBox>

          <MotionBox variants={cardVariant} key="2">
            <Card
              product={{
                img: "/image/cca.png",
                title: "CCA Attendance",
                link: "/cca",
              }}
            />
          </MotionBox>
        </MotionSimpleGrid>
      </Box>
    </Auth>
  );
}
