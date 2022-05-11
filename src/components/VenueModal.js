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
  VStack,
} from "@chakra-ui/react";
import CalendarWidget from "@components/CalendarWidget";
import React, { useState } from "react";
import { useSession } from "next-auth/react";

export default function VenueModal({ isOpen, onClose, modalData }) {
  const [selectedDate, changeDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const name = modalData.name ? modalData.name : "Venue";

  const handleModalClose = () => {
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleDate = async (date) => {
    changeDate(date);
    const { data: session, status } = useSession();
    if (session) {
      const allTimeSlots = await retrieveTimeSlots(session, modalData, date);
      console.log(allTimeSlots);
    }
  };

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
        <ModalHeader>{name}</ModalHeader>
        <ModalBody>
          <Flex>
            <Box w="full" h="full">
              <CalendarWidget selectedDate={handleDate} />
            </Box>
            {selectedDate && (
              <VStack spacing={5} align={"center"}>
                <Box>{selectedDate}</Box>
                <Box>Select Timeslot(s)</Box>
              </VStack>
            )}
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
