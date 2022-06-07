import { useState, useEffect, useRef } from "react";
import { cardVariant, parentVariant } from "@root/motion";
import { motion } from "framer-motion";
import {
  SimpleGrid,
  Box,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import Auth from "@components/sys/Auth";
import VenueCard from "@components/sys/vbs/VenueCard";
import VenueBookingModal from "@components/sys/vbs/VenueBookingModal";
import VenueBookingModalConfirmation from "@components/sys/vbs/VenueBookingModalConfirmation";
import Loading from "@components/sys/vbs/Loading";
import { fetchVenue } from "@helper/sys/vbs/venue";

import safeJsonStringify from "safe-json-stringify";

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VBS(props) {
  const [modalData, setModalData] = useState(null);
  const [modalDataConfirm, setModalDataConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [cards, setCards] = useState([]);
  const minDate = useRef(3);
  const maxDate = useRef(30);

  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(null);

  const dataFromVenueModal = (venue, venueName, date, timeSlots) => {
    if (venue && date && timeSlots && venueName) {
      const data = {
        venue: venue,
        venueName: venueName,
        date: date,
        timeSlots: timeSlots,
      };
      setModalDataConfirm(data);
    }
  };

  useEffect(() => {
    async function fetchData(props) {
      setIsLoading(true);

      const propRes = await props;
      minDate.current = props.minDate ? props.minDate : minDate.current;
      maxDate.current = props.maxDate ? props.maxDate : maxDate.current;

      if (propRes.data) {
        const res = propRes.data;
        if (res.msg.length > 0) {
          if (res.status) {
            let result = res.msg;
            if (result !== "") {
              let cardRes = [];
              result.forEach((item) => {
                if (item.visible) {
                  cardRes.push(
                    <MotionBox
                      id={item.name}
                      variants={cardVariant}
                      key={item.id}
                    >
                      <VenueCard product={item} setModalData={setModalData} />
                    </MotionBox>
                  );
                }
              });
              setCards(cardRes);
            }
            setIsLoading(false);
          }
        }
      }
    }
    fetchData(props);
  }, [props]);

  const handleSearch = (event) => {
    const searchInput = event.target.value;
    setSearch(searchInput);

    if (searchInput && searchInput != "") {
      let filteredData = cards.filter((value) => {
        return value.props.id.toLowerCase().includes(searchInput.toLowerCase());
      });

      setFilteredData(filteredData);
    } else {
      setFilteredData(null);
    }
  };

  return (
    <>
      {isLoading && (
        <Box>
          <Loading message={"Loading venues..."} />
        </Box>
      )}
      {!isLoading && (
        <Auth>
          <Box>
            <Box
              bg="white"
              borderRadius="lg"
              width={{ base: "full", md: "full", lg: "full" }}
              color="gray.700"
              shadow="base"
            >
              <InputGroup>
                <InputLeftAddon>Search:</InputLeftAddon>
                <Input
                  type="text"
                  placeholder=""
                  value={search}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Box>
            <MotionSimpleGrid
              mt="3"
              minChildWidth={{ base: "full", md: "30vh", lg: "50vh" }}
              spacing="2em"
              minH="full"
              variants={parentVariant}
              initial="initial"
              animate="animate"
            >
              {filteredData && filteredData.length ? filteredData : cards}
            </MotionSimpleGrid>
            <VenueBookingModal
              isOpen={modalData ? true : false}
              onClose={() => setModalData(null)}
              dataHandler={dataFromVenueModal}
              modalData={modalData}
              calendarMin={minDate.current}
              calendarMax={maxDate.current}
            />
            <VenueBookingModalConfirmation
              isOpen={modalDataConfirm ? true : false}
              onClose={() => setModalDataConfirm(null)}
              modalData={modalDataConfirm}
            />
          </Box>
        </Auth>
      )}
    </>
  );
}

export async function getServerSideProps(_context) {
  return {
    props: (async function () {
      try {
        const res = await fetchVenue();
        const stringifiedData = safeJsonStringify(res);
        const data = JSON.parse(stringifiedData);
        return {
          minDate: process.env.CALENDAR_MIN_DAY,
          maxDate: process.env.CALENDAR_MAX_DAY,
          data: data,
        };
      } catch (error) {
        console.error(error);
        return {
          minDate: process.env.CALENDAR_MIN_DAY,
          maxDate: process.env.CALENDAR_MAX_DAY,
          data: null,
        };
      }
    })(),
  };
}
