import {
  Heading,
  ButtonGroup,
  FormControl,
  FormLabel,
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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { cardVariant, parentVariant } from "@root/motion";
import { CCAList } from "@constants/cca";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VenueModalConfirmation({ isOpen, onClose, modalData }) {
  const [venue, setVenue] = useState(null);
  const [date, setDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState(null);
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [type, setType] = useState("1");

  const [ccaList, setCCAList] = useState(null);
  const [showCCAs, setShowCCAs] = useState(false);

  useEffect(() => {
    if (modalData) {
      buildText(modalData);
      buildCCAList();
    }
  }, [modalData]);

  const buildCCAList = () => {
    const selection = [];
    if (CCAList) {
      for (let key in CCAList) {
        if (CCAList[key]) {
          selection.push(
            <option key={CCAList[key]} value={CCAList[key]}>
              {CCAList[key]}
            </option>
          );
        }
      }
    }

    setCCAList(selection);
  };

  const buildText = (modalData) => {
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
        setShowCCAs(true);
      } else {
        setShowCCAs(false);
      }

      setType(event);
    }
  };

  const onCCASelectionChange = (event) => {
    console.log(event.target.value);
  };

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
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
          {venue && date && timeSlots && (
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
                            isRequired={true}
                            value={email}
                            onChange={(event) =>
                              setEmail(event.currentTarget.value)
                            }
                            type="email"
                            placeholder="Enter your email here"
                          />
                        </InputGroup>
                        <InputGroup>
                          <InputLeftAddon>Purpose </InputLeftAddon>
                          <Textarea
                            isRequired={true}
                            value={purpose}
                            onChange={(event) =>
                              setPurpose(event.currentTarget.value)
                            }
                            placeholder="Enter your purpose"
                          />
                        </InputGroup>
                      </Stack>
                    </Box>
                  </Stack>
                </Flex>
              </MotionBox>
            </MotionSimpleGrid>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            bg="cyan.700"
            color="white"
            w="150px"
            size="lg"
            onClick={onClose}
            _hover={{ bg: "cyan.800" }}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
