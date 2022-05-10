import {
  Box,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";
import CalendarWidget from "@components/CalendarWidget";
import React, { useState } from "react";
import { getSession } from "next-auth/react";

export default function VenueModal({ isOpen, onClose, modalData }) {
  const [selectedDate, changeDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  const handleModalClose = () => {
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleDate = async (date) => {
    changeDate(date);
    const session = await getSession();
    if (session) {
      const allTimeSlots = await retrieveTimeSlots(session, modalData, date);
    }
  }

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>{modalData.name}</ModalHeader>
        <ModalBody>
        <Flex>
          <Box w="full" h="full">
            <CalendarWidget selectedDate={handleDate}/>
          </Box>
          <VStack spacing={5} align={"center"}>
            <Box>
              {selectedDate}
            </Box>
          </VStack>
        </Flex>
        </ModalBody>
        <ModalFooter>
          <Button
            bg="cyan.700"
            color="white"
            w="150px"
            size="lg"
            onClick={handleModalClose}
            _hover={{ bg: "cyan.800" }}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
