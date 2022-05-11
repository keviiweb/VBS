import { useState, useEffect } from "react";
import { cardVariant, parentVariant } from "@root/motion";
import { motion } from "framer-motion";
import { SimpleGrid, Box } from "@chakra-ui/react";
import Auth from "@components/Auth";
import VenueCard from "@components/VenueCard";
import VenueModal from "@components/VenueModal";
import Loading from "@components/Loading";
import { fetchVenue } from "@constants/helper";
import { getSession } from 'next-auth/react';
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VBS(props) {
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData(props) {
      const res = await props;
      const resData = res.data;
      console.log("RES " + res);
      console.log("RES D " + resData);
      if (resData.length > 0) {
        setData(res?.data);
      }
      setIsLoading(false);
    }
    fetchData(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  var result = null;
  var cards = [];
  if (data) {
    if (data.status) {
      result = data.msg;
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

      console.log(cards);
    }

  }

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && (
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
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  return {
    props: (async function () {
      try {
        const session = await getSession(context);
        console.log("Session", JSON.stringify(session, null, 2));

        const data = fetchVenue(session);
        if (!data && !session) {
          return {
            data: null,
          };
        } else {
          return {
            data: data,
          };
        }
      } catch (error) {
        console.error(error);
        return {
          data: null,
        };
      }
    })(),
  };
}
