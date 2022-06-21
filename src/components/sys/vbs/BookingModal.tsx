import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { cardVariant, parentVariant } from '@root/motion';

import TableWidget from '@components/sys/vbs/TableWidget';

import { BookingRequest } from 'types/bookingReq';
import { Result } from 'types/api';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function BookingModal({ isAdmin, isOpen, onClose, modalData }) {
  const [loadingData, setLoadingData] = useState(true);
  const [id, setID] = useState(null);
  const [venue, setVenue] = useState(null);
  const [date, setDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState(null);
  const [email, setEmail] = useState(null);
  const [cca, setCCA] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [status, setStatus] = useState(null);

  const reset = () => {
    setID(null);
    setVenue(null);
    setDate(null);
    setTimeSlots(null);
    setEmail(null);
    setCCA(null);
    setPurpose(null);
    setConflict(null);
    setStatus(null);
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const processConflicts = async (conflicts: BookingRequest[]) => {
    try {
      const rawResponse = await fetch('/api/bookingReq/format', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookings: conflicts,
        }),
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        setConflict(content.msg);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    async function setupData() {
      setID(modalData.id);
      setVenue(modalData.venue);
      setDate(modalData.dateStr);
      setTimeSlots(modalData.timeSlots);
      setEmail(modalData.email);
      setCCA(modalData.cca);
      setPurpose(modalData.purpose);
      setStatus(modalData.status);

      if (
        modalData.conflictRequestObj &&
        modalData.conflictRequestObj.length > 0
      ) {
        await processConflicts(modalData.conflictRequestObj);
      }

      setLoadingData(false);
    }

    if (modalData) {
      setupData();
    }
  }, [modalData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Venue',
        accessor: 'venue',
      },
      {
        Header: 'Date',
        accessor: 'dateStr',
      },
      {
        Header: 'Timeslot(s)',
        accessor: 'timeSlots',
      },
      {
        Header: 'CCA',
        accessor: 'cca',
      },
      {
        Header: 'Purpose',
        accessor: 'purpose',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
    ],
    [],
  );

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={handleModalCloseButton}
      size='full'
      isCentered
      motionPreset='slideInBottom'
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader />
        <ModalBody>
          <MotionSimpleGrid
            mt='3'
            minChildWidth='250px'
            spacing='2em'
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox variants={cardVariant} key='2'>
              {modalData && (
                <Flex
                  w='full'
                  h='full'
                  alignItems='center'
                  justifyContent='center'
                  m='4'
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
                          Booking Request Details
                        </Text>

                        <List spacing={5}>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Reference No:
                            </Text>{' '}
                            {id}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Venue:
                            </Text>{' '}
                            {venue}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Date:
                            </Text>{' '}
                            {date}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Timeslot(s):
                            </Text>{' '}
                            {timeSlots}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Contact Email:
                            </Text>{' '}
                            {email}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              CCA:
                            </Text>{' '}
                            {cca}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Purpose:
                            </Text>{' '}
                            {purpose}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Status:
                            </Text>{' '}
                            {status}
                          </ListItem>
                        </List>
                      </Box>

                      {isAdmin && conflict && loadingData && (
                        <Box overflow='auto'>
                          <Text
                            fontSize={{ base: '16px', lg: '18px' }}
                            fontWeight='500'
                            textTransform='uppercase'
                            mb='4'
                          >
                            Conflicting Requests
                          </Text>
                          <Text>Loading Please wait...</Text>
                        </Box>
                      )}

                      {isAdmin && conflict && !loadingData && (
                        <Box overflow='auto'>
                          <Text
                            fontSize={{ base: '16px', lg: '18px' }}
                            fontWeight='500'
                            textTransform='uppercase'
                            mb='4'
                          >
                            Conflicting Requests
                          </Text>
                          <TableWidget
                            key={2}
                            columns={columns}
                            data={conflict}
                            controlledPageCount={
                              modalData.conflictRequest.length
                                ? modalData.conflictRequest.length
                                : 0
                            }
                            dataHandler={null}
                          />
                        </Box>
                      )}

                      {isAdmin && !conflict && loadingData && (
                        <Box overflow='auto'>
                          <Text
                            fontSize={{ base: '16px', lg: '18px' }}
                            fontWeight='500'
                            textTransform='uppercase'
                            mb='4'
                          >
                            Conflicting Requests
                          </Text>
                          <Text>Loading Please wait...</Text>
                        </Box>
                      )}

                      {isAdmin && !conflict && !loadingData && (
                        <Box overflow='auto'>
                          <Text
                            fontSize={{ base: '16px', lg: '18px' }}
                            fontWeight='500'
                            textTransform='uppercase'
                            mb='4'
                          >
                            Conflicting Requests
                          </Text>
                          <Text
                            fontSize={{ base: '16px', lg: '18px' }}
                            fontWeight='500'
                            textTransform='uppercase'
                            mb='4'
                          >
                            No conflicting requests found
                          </Text>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </Flex>
              )}
            </MotionBox>
          </MotionSimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button
            bg='cyan.700'
            color='white'
            w='150px'
            size='lg'
            onClick={handleModalCloseButton}
            _hover={{ bg: 'cyan.800' }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
