import { cardVariant, parentVariant } from "@root/motion";
import { motion } from "framer-motion";
import { SimpleGrid, Box } from "@chakra-ui/react";
import Auth from "@components/Auth";
import { getAllLocation } from "@constants/helper";
import { getSession } from "next-auth/react"
import ProductCard from "@components/ProductCard";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VBS(props) {
  if (props.data && props.data.status) {
    var result = props.data.msg;
    result = JSON.stringify(result); 
    if (result !== "") {
        console.log(result);
    }
  }

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
        </MotionSimpleGrid>
      </Box>
    </Auth>
  );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session) {
        return {
            notFound: true,
          }
    }

    const data = await getAllLocation(session);
    if (!data) {
        return {
            notFound: true,
          }
    }

    return { props: { data } }
}
