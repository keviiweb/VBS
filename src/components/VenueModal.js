import {
  ButtonGroup,
  Button,
  Box,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import CalendarWidget from "@components/CalendarWidget";
import TimeSlotButton from "@components/TimeSlotButton";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { cardVariant, parentVariant } from "@root/motion";
import { numberToWeekday } from "@constants/weekdays";
import { monthNamesFull } from "@constants/months";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VenueModal({
  isOpen,
  onClose,
  dataHandler,
  modalData,
  calendarMin,
  calendarMax,
}) {
  const [selectedDate, changeDate] = useState(null);
  const date = useRef(null);

  const id = modalData && modalData.id ? modalData.id : "";
  const name = modalData && modalData.name ? modalData.name : "Venue";
  const desc = modalData && modalData.description ? modalData.description : "";
  const isChildVenue =
    modalData && modalData.isChildVenue ? modalData.isChildVenue : false;

  const [hasChildVenue, setHasChildVenue] = useState(false);
  const [childVenueDrop, setChildVenueDrop] = useState(null);
  const [rawChildVenue, setRawChildVenue] = useState([]);
  const [displayedVenue, setDisplayedVenue] = useState(null);
  const selectedVenue = useRef("");

  const [timeSlots, setTimeSlots] = useState([]);
  const [displayedSlots, setDisplayedSlots] = useState(null);

  const rawSlots = useRef([]);
  const selectedTimeSlots = useRef([]);

  const reset = () => {
    changeDate(null);
    setHasChildVenue(false);
    setChildVenueDrop(null);
    setRawChildVenue([]);
    setDisplayedVenue(null);
    setDisplayedSlots(null);
    setTimeSlots([]);
    selectedTimeSlots.current = [];
    rawSlots.current = [];
    selectedVenue.current = [];
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const handleSubmit = () => {
    setTimeout(() => {
      dataHandler(
        selectedVenue.current,
        displayVenue(selectedVenue.current),
        date.current,
        selectedTimeSlots.current
      );
      reset();
      onClose();
    }, 200);
  };

  useEffect(() => {
    async function fetchData() {
      if (!isChildVenue) {
        try {
          const rawResponse = await fetch("/api/venue", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ venue: id }),
          });
          const content = await rawResponse.json();
          if (content.length > 0) {
            setRawChildVenue(content);
            await buildChildVenueDropdown(content);
            setHasChildVenue(true);
          }
        } catch (error) {}
      }
    }

    if (modalData) {
      selectedVenue.current = modalData && modalData.id ? modalData.id : "";
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalData]);

  // Child venue generation
  const buildChildVenueDropdown = async (content) => {
    const selection = [];
    if (modalData) {
      selection.push(
        <option key={modalData.id} value={modalData.id}>
          Whole Venue
        </option>
      );
    }

    for (var key in content) {
      selection.push(
        <option key={content[key].id} value={content[key].id}>
          {content[key].name}
        </option>
      );
    }
    setChildVenueDrop(selection);
  };

  const onChildVenueChange = (event) => {
    if (event.target.value) {
      selectedVenue.current = event.target.value;
      buildTimeSlot(rawSlots.current);
      selectedTimeSlots.current = [];
      displaySlots(null);
    }
  };

  const displayVenue = (venue) => {
    if (id && venue == id) {
      return name + " (Whole Venue)";
    } else {
      if (rawChildVenue) {
        for (var key in rawChildVenue) {
          if (rawChildVenue[key].id == venue) {
            return rawChildVenue[key].name;
          }
        }
      }
    }

    return "";
  };

  // Timeslot generation
  const prettifyDate = async (date) => {
    if (date) {
      const dateObj = new Date(date);
      const day = numberToWeekday[dateObj.getDay()];
      const month = monthNamesFull[dateObj.getMonth()];
      const prettyDate = `${day}, ${dateObj.getDate()} ${month} ${dateObj.getFullYear()}`;
      return prettyDate;
    }
  };

  const handleClickTimeSlots = async (id) => {
    if (id) {
      const slots = selectedTimeSlots.current;
      if (rawSlots.current) {
        if (slots[id]) {
          slots[id] = null;
        } else {
          slots[id] = rawSlots.current[id];
        }
      }
      selectedTimeSlots.current = slots;
      displaySlots(slots);
    }
  };

  const countSlots = (slots) => {
    var counter = 0;
    for (var key in slots) {
      if (slots.hasOwnProperty(key)) {
        if (slots[key]) {
          counter += 1;
        }
      }
    }
    return counter;
  };

  const displaySlots = (slots) => {
    if (slots) {
      setDisplayedVenue(displayVenue(selectedVenue.current));
      const text = `Selected timeslot(s): `;
      var counter = 0;
      const total = countSlots(slots);
      if (slots) {
        for (var key in slots) {
          if (slots.hasOwnProperty(key)) {
            if (slots[key]) {
              counter += 1;
              if (counter != total) {
                text += ` ${slots[key].slot} ,`;
              } else {
                text += ` ${slots[key].slot} `;
              }
            }
          }
        }
        const time = total * 30;
        text += ` (${time} minutes)`;
      }

      setDisplayedSlots(text);
    } else {
      setDisplayedSlots(null);
    }
  };

  const buildTimeSlot = (content) => {
    const buttons = [];
    if (content) {
      try {
        for (var key in content) {
          if (content.hasOwnProperty(key)) {
            if (content[key]) {
              const newID = selectedVenue.current + date.current + key;
              if (!content[key].booked) {
                buttons.push(
                  <TimeSlotButton
                    disable={false}
                    key={newID}
                    handleClick={handleClickTimeSlots}
                    newKey={newID}
                    id={key}
                    slot={content[key].slot}
                  />
                );
              } else {
                buttons.push(
                  <TimeSlotButton
                    disable={true}
                    key={newID}
                    newKey={newID}
                    id={key}
                    slot={content[key].slot}
                  />
                );
              }
            }
          }
        }
      } catch (error) {}
    }

    setTimeSlots(buttons);
  };

  const handleDate = async (dateObj) => {
    if (dateObj && dateObj !== new Date()) {
      setDisplayedSlots(null);
      selectedTimeSlots.current = [];
      const prettified = await prettifyDate(dateObj);
      date.current = prettified;
      changeDate(prettified);
      try {
        const rawResponse = await fetch("/api/timeslot", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ venue: id, date: dateObj }),
        });
        const content = await rawResponse.json();
        rawSlots.current = content;
        buildTimeSlot(content);
      } catch (error) {}
    }
  };

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={handleModalCloseButton}
      size="full"
      isCentered
      motionPreset="slideInBottom"
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>{name}</ModalHeader>
        <ModalBody>
          <Text>{desc}</Text>
          {hasChildVenue && childVenueDrop && (
            <>
              <Box>
                <Flex
                  w="full"
                  h="full"
                  alignItems="center"
                  justifyContent="center"
                  bg="white"
                  rounded="xl"
                  shadow="lg"
                  borderWidth="1px"
                  m="4"
                >
                  <Stack spacing={5} w="full" align={"center"}>
                    <Text>Select Venue</Text>
                    <Select onChange={onChildVenueChange} size="sm">
                      {childVenueDrop}
                    </Select>
                  </Stack>
                </Flex>
              </Box>
            </>
          )}

          <MotionSimpleGrid
            mt="3"
            minChildWidth="250px"
            spacing="2em"
            minH="full"
            variants={parentVariant}
            initial="initial"
            animate="animate"
          >
            <CalendarWidget
              selectedDate={handleDate}
              calendarMin={calendarMin}
              calendarMax={calendarMax}
            />
            <MotionBox variants={cardVariant} key="2">
              <Flex
                w="full"
                h="full"
                alignItems="center"
                justifyContent="center"
                bg="white"
                rounded="xl"
                shadow="lg"
                borderWidth="1px"
              >
                {selectedDate && timeSlots && (
                  <Box
                    w="100%"
                    h="full"
                    position="relative"
                    overflow="hidden"
                    roundedTop="lg"
                  >
                    <Box align={"center"}>
                      <Box>{selectedDate}</Box>
                      <Box mb={5}>Select Timeslot(s)</Box>
                      <Stack direction={["column", "row"]} align={"center"}>
                        <ButtonGroup display={"flex"} flexWrap={"wrap"}>
                          {timeSlots}
                        </ButtonGroup>
                      </Stack>
                    </Box>
                  </Box>
                )}

                {!selectedDate && (
                  <Box spacing={600}>
                    <Stack spacing={5} align={"center"}>
                      <Text>Please select a date</Text>
                    </Stack>
                  </Box>
                )}
              </Flex>
            </MotionBox>
          </MotionSimpleGrid>

          {displayedSlots && (
            <Box>
              <Flex
                w="full"
                h="full"
                alignItems="center"
                justifyContent="center"
                bg="white"
                rounded="xl"
                shadow="lg"
                borderWidth="1px"
                m="4"
              >
                <Stack align={"center"}>
                  <Text>Venue: {displayedVenue}</Text>
                  <Text>{displayedSlots}</Text>
                </Stack>
              </Flex>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            bg="cyan.700"
            color="white"
            w="150px"
            size="lg"
            onClick={handleSubmit}
            _hover={{ bg: "cyan.800" }}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
