import {
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
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
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Switch,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { cardVariant, parentVariant } from "@root/motion";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VenueModalConfirmation({ isOpen, onClose, modalData }) {
  //display
  const [venue, setVenue] = useState(null);
  const [date, setDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState(null);
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [type, setType] = useState("1");
  const [error, setError] = useState(null);
  const [success, setSuccessBooking] = useState(false);

  const [ccaList, setCCAList] = useState(null);
  const [showCCAs, setShowCCAs] = useState(false);
  const CCALIST = useRef([]);

  const [isSwitch, setIsSwitch] = useState(false);

  //variable for db
  const emailDB = useRef(null);
  const venueNameDB = useRef(null);
  const venueDB = useRef(null);
  const dateDB = useRef(null);
  const timeSlotsDB = useRef(null);
  const typeDB = useRef("PERSONAL");
  const purposeDB = useRef(null);

  const reset = () => {
    setVenue(null);
    setDate(null);
    setTimeSlots(null);
    setEmail("");
    setPurpose("");
    setType("1");
    setError(null);
    setCCAList(null);
    setShowCCAs(false);
    setSuccessBooking(false);
    setIsSwitch(false);

    emailDB.current = null;
    venueNameDB.current = null;
    venueDB.current = null;
    dateDB.current = null;
    timeSlotsDB.current = null;
    typeDB.current = "PERSONAL";
    purposeDB.current = null;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!isSwitch) {
      setError("Please toggle the confirmation switch.");
      return;
    }

    if (
      validateFields(
        emailDB.current,
        venueDB.current,
        venueNameDB.current,
        dateDB.current,
        timeSlotsDB.current,
        typeDB.current,
        purposeDB.current
      )
    ) {
      await submitBookingRequest(
        emailDB.current,
        venueDB.current,
        venueNameDB.current,
        dateDB.current,
        timeSlotsDB.current,
        typeDB.current,
        purposeDB.current
      );
    }

    /*
    setTimeout(() => {
      reset();
      onClose();
    }, 200);*/
  };

  const submitBookingRequest = async (
    email,
    venueID,
    venueName,
    date,
    timeSlots,
    type,
    purpose
  ) => {
    try {
      const rawResponse = await fetch("/api/bookingReq/create", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          venue: venueID,
          venueName: venueName,
          date: date,
          timeSlots: timeSlots,
          type: type,
          purpose: purpose,
        }),
      });
      const content = await rawResponse.json();
      if (content.status) {
        setSuccessBooking(true);
        setTimeout(() => {
          handleModalCloseButton();
        }, 5000);
      } else {
        setSuccessBooking(false);
      }
    } catch (error) {}
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  useEffect(() => {
    async function fetchData() {
      await buildText(modalData);
      await buildCCAList();
      venueNameDB.current = modalData ? modalData.venueName : null;
      venueDB.current = modalData ? modalData.venue : null;
      dateDB.current = modalData ? modalData.date : null;
      timeSlotsDB.current = modalData ? modalData.timeSlots : null;
    }

    if (modalData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalData]);

  const buildCCAList = async () => {
    const selection = [];

    try {
      const rawResponse = await fetch("/api/cca", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.length > 0) {
        CCALIST.current = [];
        for (let key in content) {
          if (content[key]) {
            CCALIST.current.push({
              id: content[key].id,
              name: content[key].name,
            });
            selection.push(
              <option key={content[key].id} value={content[key].id}>
                {content[key].name}
              </option>
            );
          }
        }

        setCCAList(selection);
      }
    } catch (error) {}
  };

  const buildText = async (modalData) => {
    setVenue(modalData.venueName);
    setDate(modalData.date);

    const str = ``;
    for (let key in modalData.timeSlots) {
      if (modalData.timeSlots[key]) {
        str += `\n${modalData.timeSlots[key].slot}`;
      }
    }

    setTimeSlots(str);
  };

  const setTypeHelper = (event) => {
    if (event) {
      if (event == 2) {
        typeDB.current = CCALIST.current[0].id;
        setShowCCAs(true);
      } else {
        typeDB.current = "PERSONAL";
        setShowCCAs(false);
      }

      setType(event);
    }
  };

  const onCCASelectionChange = (event) => {
    typeDB.current = event.target.value;
  };

  const check = (timeSlots) => {
    if (timeSlots.length == 0) {
      return false;
    }

    for (let key in timeSlots) {
      if (timeSlots[key]) {
        if (timeSlots[key].id) {
          return true;
        }
      }
    }

    return false;
  };

  const validateFields = (
    email,
    venue,
    venueName,
    date,
    timeSlots,
    type,
    purpose
  ) => {
    //super basic validation here
    if (email) {
      if (!email.includes("@u.nus.edu")) {
        setError("Please use your school email.");
        return false;
      }
    } else {
      setError("Please include an email.");
      return false;
    }

    if (!date) {
      setError("No date found");
      return false;
    }

    if (!venue) {
      setError("No venues found");
      return false;
    }

    if (!venueName) {
      setError("No venues found");
      return false;
    }

    if (!timeSlots || !check(timeSlots)) {
      setError("No timeslots found");
      return false;
    }

    if (type) {
      if (type !== "PERSONAL") {
        let found = false;
        for (let i in CCALIST.current) {
          if (type == CCALIST.current[i].id) {
            found = true;
          }
        }

        if (!found) {
          setError("Not valid CCA");
          return false;
        }
      }
    } else {
      setError("No type found");
      return false;
    }

    if (!purpose) {
      setError("Please write a purpose for the booking.");
      return false;
    }

    setError(null);
    return true;
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
        <ModalHeader>Timeslot Confirmation</ModalHeader>
        <ModalBody>
          {success && (
            <Box textAlign="center" py={10} px={6}>
              <CheckCircleIcon boxSize={"50px"} color={"green.500"} />
              <Heading as="h2" size="xl" mt={6} mb={2}>
                Successful booking!
              </Heading>
              <Text color={"gray.500"}>
                Please wait a few days for the admin to approve your request..
              </Text>
              <Text color={"gray.500"}>
                The page will be closed after 5 seconds...
              </Text>
            </Box>
          )}
          {!success && venue && date && timeSlots && (
            <MotionSimpleGrid
              mt="3"
              minChildWidth="250px"
              spacing="2em"
              minH="full"
              variants={parentVariant}
              initial="initial"
              animate="animate"
            >
              <MotionBox variants={cardVariant} key="2">
                <Flex align={"center"} justify={"center"} mt={-10}>
                  <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
                    <Stack align={"center"}>
                      <Heading fontSize={"3xl"}>Confirm your booking</Heading>
                      {error && <Text>{error}</Text>}
                    </Stack>
                    <Box rounded={"lg"} boxShadow={"lg"} p={8}>
                      <Stack spacing={3}>
                        <Text fontSize="xl">Venue: {venue}</Text>
                        <Text fontSize="xl">Date: {date}</Text>
                        <Text fontSize="xl">Timeslot: {timeSlots}</Text>
                        <RadioGroup
                          onChange={(event) => setTypeHelper(event)}
                          value={type}
                          name={venue}
                        >
                          <Stack direction="row">
                            <Radio value="1">Personal</Radio>
                            <Radio value="2">CCA</Radio>
                          </Stack>
                        </RadioGroup>

                        {showCCAs && ccaList && (
                          <Select onChange={onCCASelectionChange} size="sm">
                            {ccaList}
                          </Select>
                        )}

                        <InputGroup>
                          <InputLeftAddon>Email </InputLeftAddon>
                          <Input
                            isRequired
                            value={email}
                            onChange={(event) => {
                              setEmail(event.currentTarget.value);
                              emailDB.current = event.currentTarget.value;
                            }}
                            type="email"
                            placeholder="Enter your email here"
                          />
                        </InputGroup>
                        <InputGroup>
                          <InputLeftAddon>Purpose </InputLeftAddon>
                          <Textarea
                            isRequired
                            value={purpose}
                            onChange={(event) => {
                              setPurpose(event.currentTarget.value);
                              purposeDB.current = event.currentTarget.value;
                            }}
                            placeholder="Enter your purpose"
                          />
                        </InputGroup>
                      </Stack>
                    </Box>

                    <Stack direction="row">
                      <Text mr={8}>
                        I have confirmed that the details are correct{" "}
                      </Text>
                      <Switch
                        isRequired
                        value={isSwitch}
                        onChange={setIsSwitch}
                      />
                    </Stack>
                  </Stack>
                </Flex>
              </MotionBox>
            </MotionSimpleGrid>
          )}
        </ModalBody>
        <ModalFooter>
          {!success && (
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
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
