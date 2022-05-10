import { useState } from "react";
import { cardVariant, parentVariant } from "@root/motion";
import { motion } from "framer-motion";
import { SimpleGrid, Box } from "@chakra-ui/react";
import Auth from "@components/Auth";
import { getAllLocation } from "@constants/helper";
import { getSession } from "next-auth/react";
import VenueCard from "@components/VenueCard";
import VenueModal from "@components/VenueModal";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VBS(props) {
  const [modalData, setModalData] = useState(null);

  var result = null;
  var cards = [];

  if (props.data && props.data.status) {
    result = props.data.msg;
    if (result !== "") {
      result.forEach((item) => {
        if (item.visible) {
          cards.push(
            <MotionBox variants={cardVariant} key={item.id}>
              <VenueCard product={item} setModalData={setModalData} />
            </MotionBox>
          );
        }
      });
    }
  }

  return (
    <Auth>
      <Box>
        <MotionSimpleGrid
          mt="4"
          minChildWidth="20vw"
          spacing="2em"
          minH="full"
          variants={parentVariant}
          initial="initial"
          animate="animate"
        >
          {cards}
        </MotionSimpleGrid>
        <VenueModal
          isOpen={modalData ? true : false}
          onClose={() => setModalData(null)}
          modalData={modalData}
        />
      </Box>
    </Auth>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      notFound: true,
    };
  }

  const data = await getAllLocation(session);
  if (!data) {
    return {
      notFound: true,
    };
  }

  return { props: { data } };
}
