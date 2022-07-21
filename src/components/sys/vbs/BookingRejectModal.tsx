import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Stack,
  StackDivider,
  Text,
} from '@chakra-ui/react';
import { checkerString } from '@constants/sys/helper';

/**
 * Renders a modal that pops up when the user presses the reject button.
 *
 * The user is required to type in a reason for rejection.
 *
 * @param param0 Modal functions such as isOpen, onClose as well as callback function dataHandler
 * @returns A modal with an input box for reason
 */
export default function BookingRejectModal({
  isOpen,
  onClose,
  modalData,
  dataHandler,
}) {
  const [reason, setReason] = useState('');
  const reasonDB = useRef('');

  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [timeSlots, setTimeSlots] = useState('');
  const [cca, setCCA] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => {
    setReason('');
    setDate('');
    setVenue('');
    setTimeSlots('');
    setCCA('');
    setErrorMsg('');

    reasonDB.current = '';
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const handleSubmit = async (e: {
    cancelable: any;
    preventDefault: () => void;
  }) => {
    if (e.cancelable) {
      e.preventDefault();
    }

    if (checkerString(reasonDB.current)) {
      setErrorMsg('');
      await dataHandler(reasonDB.current, modalData);

      setTimeout(() => {
        reset();
        onClose();
      }, 200);
    } else {
      setErrorMsg('Please type in a reason!');
    }
  };

  useEffect(() => {
    async function setupData() {
      setVenue(modalData.venue);
      setDate(modalData.dateStr);
      setTimeSlots(modalData.timeSlots);
      setCCA(modalData.cca);
    }

    if (modalData) {
      setupData();
    }
  }, [modalData]);

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={handleModalCloseButton}
      size='lg'
      isCentered
      motionPreset='slideInBottom'
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader />
        <ModalBody>
          <Box mb={30}>
            {modalData && (
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
              >
                <Stack spacing={{ base: 6, md: 10 }}>
                  <Stack
                    spacing={{ base: 4, sm: 6 }}
                    direction='column'
                    divider={<StackDivider borderColor='gray.200' />}
                  >
                    <Box>
                      <Text
                        fontSize={{ base: '16px', lg: '18px' }}
                        fontWeight='500'
                        textTransform='uppercase'
                        mb='4'
                      >
                        Reason for rejecting:
                      </Text>
                      <Text>Venue: {venue}</Text>
                      <Text>Date: {date}</Text>
                      <Text>Timeslot(s): {timeSlots}</Text>
                      <Text>CCA: {cca}</Text>
                    </Box>
                  </Stack>
                  <Stack>
                    <Input
                      type='text'
                      placeholder='Type in a reason'
                      value={reason}
                      size='lg'
                      onChange={(event) => {
                        setReason(event.currentTarget.value);
                        reasonDB.current = event.currentTarget.value;
                      }}
                    />
                    {errorMsg && <Text>{errorMsg}</Text>}
                  </Stack>
                </Stack>
              </Flex>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            bg='cyan.700'
            color='white'
            w='150px'
            size='lg'
            onClick={handleSubmit}
            _hover={{ bg: 'cyan.800' }}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
