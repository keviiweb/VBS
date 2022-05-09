import { useState } from "react";
import { cardVariant, parentVariant } from "@root/motion";
import ProductModal from "@components/ProductModal ";
import { motion } from "framer-motion";
import { LinkBox, SimpleGrid, Text, Box } from "@chakra-ui/react";
import Auth from "@components/Auth";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(LinkBox);

export default function Home() {
  const [modalData, setModalData] = useState(null);
  return (
    <Auth>
      <Box>
        <MotionSimpleGrid
          mt="6"
          minChildWidth="250px"
          spacing="2em"
          minH="full"
          variants={parentVariant}
          initial="initial"
          animate="animate"
        >
          <MotionBox variants={cardVariant} key="1" href="/vbs">
            <Text>Venue Booking System</Text>
          </MotionBox>
          <MotionBox variants={cardVariant} key="1" href="/cca">
            <Text>CCA Attendance Tracking</Text>
          </MotionBox>
        </MotionSimpleGrid>
        <ProductModal
          isOpen={modalData ? true : false}
          onClose={() => setModalData(null)}
          modalData={modalData}
        />
      </Box>
    </Auth>
  );
}
