import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { BookingRequest } from 'types/vbs/bookingReq';
import { Result } from 'types/api';

import { checkerString } from '@constants/sys/helper';

import { InfoOutlineIcon } from '@chakra-ui/icons';

/**
 * Renders a modal that displays information about the venue booking request
 *
 * If the isBookingRequest flag is set, the modal is about the venue booking request
 *
 * Else, the modal is about the approved venue booking
 *
 * @param param0 Modal functions such as isOpen, onClose as well as data from handler
 * @returns A modal containing Booking information
 */
export default function BookingModal({
  isAdmin,
  isBookingRequest,
  isOpen,
  onClose,
  modalData,
}) {
  const [loadingData, setLoadingData] = useState(true);
  const [id, setID] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [timeSlots, setTimeSlots] = useState('');
  const [email, setEmail] = useState('');
  const [cca, setCCA] = useState('');
  const [purpose, setPurpose] = useState('');
  const [conflict, setConflict] = useState<BookingRequest[]>([]);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [userName, setUserName] = useState('');

  const pageSize = 10;

  const [pageCount, setPageCount] = useState(0);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  let generateData: any;

  const reset = useCallback(() => {
    setLoadingData(true);

    setID('');
    setVenue('');
    setDate('');
    setTimeSlots('');
    setEmail('');
    setCCA('');
    setPurpose('');
    setConflict([]);
    setStatus('');
    setReason('');
    setUserName('');

    setPageCount(0);
    setSubmitButtonPressed(false);
  }, []);

  const handleDetails = useCallback(
    (content: BookingRequest) => {
      generateData(content);
    },
    [generateData],
  );

  const handleModalCloseButton = useCallback(() => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  }, [reset, onClose]);

  const generateActionButton = useCallback(
    async (content: BookingRequest) => {
      const button: JSX.Element = (
        <Button
          size='sm'
          leftIcon={<InfoOutlineIcon />}
          onClick={() => handleDetails(content)}
        >
          View Details
        </Button>
      );

      return button;
    },
    [handleDetails],
  );

  const includeActionButton = useCallback(
    async (content: BookingRequest[]) => {
      for (let key = 0; key < content.length; key += 1) {
        const dataField: BookingRequest = content[key];
        const buttons = await generateActionButton(dataField);
        dataField.action = buttons;
      }

      setConflict(content);
    },
    [generateActionButton],
  );

  const processConflicts = useCallback(
    async (conflicts: BookingRequest[]) => {
      setSubmitButtonPressed(true);
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
          await includeActionButton(content.msg);
        }
      } catch (error) {
        console.error(error);
      }
      setSubmitButtonPressed(false);
    },
    [includeActionButton],
  );

  generateData = useCallback(
    async (modalDataField: BookingRequest) => {
      if (modalDataField.id !== undefined && checkerString(modalDataField.id)) {
        setID(modalDataField.id);
      } else {
        setID('');
      }

      if (checkerString(modalDataField.venue)) {
        setVenue(modalDataField.venue);
      } else {
        setVenue('');
      }

      if (
        modalDataField.dateStr !== undefined &&
        checkerString(modalDataField.dateStr)
      ) {
        setDate(modalDataField.dateStr);
      } else {
        setDate('');
      }

      if (checkerString(modalDataField.timeSlots)) {
        setTimeSlots(modalDataField.timeSlots);
      } else {
        setTimeSlots('');
      }

      if (checkerString(modalDataField.email)) {
        setEmail(modalDataField.email);
      } else {
        setEmail('');
      }

      if (checkerString(modalDataField.cca)) {
        setCCA(modalDataField.cca);
      } else {
        setCCA('');
      }

      if (checkerString(modalDataField.purpose)) {
        setPurpose(modalDataField.purpose);
      } else {
        setPurpose('');
      }

      if (
        modalDataField.status !== undefined &&
        checkerString(modalDataField.status)
      ) {
        setStatus(modalDataField.status);
      } else {
        setStatus('');
      }

      if (
        modalDataField.userName !== undefined &&
        checkerString(modalDataField.userName)
      ) {
        setUserName(modalDataField.userName);
      } else {
        setUserName('');
      }

      if (
        (isAdmin as boolean) &&
        (isBookingRequest as boolean) &&
        modalDataField.conflictRequestObj != null &&
        modalDataField.conflictRequestObj.length > 0
      ) {
        if (modalDataField.conflictRequestObj.length % pageSize === 0) {
          setPageCount(
            Math.floor(modalDataField.conflictRequestObj.length / pageSize),
          );
        } else {
          setPageCount(
            Math.floor(modalDataField.conflictRequestObj.length / pageSize) + 1,
          );
        }

        await processConflicts(modalDataField.conflictRequestObj);
      } else if (
        (isAdmin as boolean) &&
        (isBookingRequest as boolean) &&
        modalDataField.conflictRequestObj != null &&
        modalDataField.conflictRequestObj?.length === 0
      ) {
        setConflict([]);
      }

      if (
        modalDataField.reason !== undefined &&
        checkerString(modalDataField.reason)
      ) {
        setReason(modalDataField.reason);
      } else {
        setReason('');
      }

      setLoadingData(false);
    },
    [isBookingRequest, processConflicts, isAdmin],
  );

  useEffect(() => {
    async function setupData(modalDataField: BookingRequest) {
      await generateData(modalDataField);
    }

    if (modalData !== null && modalData !== undefined) {
      setupData(modalData);
    }
  }, [modalData, isBookingRequest, generateData]);

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
      {
        Header: 'Action',
        accessor: 'action',
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
          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />

          <SimpleGrid mt='3' minChildWidth='250px' spacing='2em' minH='full'>
            <Box>
              {modalData !== null && modalData !== undefined && (
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
                        {(isBookingRequest as boolean) && (
                          <Text
                            fontSize={{ base: '16px', lg: '18px' }}
                            fontWeight='500'
                            textTransform='uppercase'
                            mb='4'
                          >
                            Booking Request Details
                          </Text>
                        )}

                        {!(isBookingRequest as boolean) && (
                          <Text
                            fontSize={{ base: '16px', lg: '18px' }}
                            fontWeight='500'
                            textTransform='uppercase'
                            mb='4'
                          >
                            Booking Details
                          </Text>
                        )}

                        <List spacing={5}>
                          {checkerString(id) && (
                            <ListItem key='book-ref'>
                              <Text as='span' fontWeight='bold'>
                                Reference No:{' '}
                              </Text>
                              {id}
                            </ListItem>
                          )}

                          {checkerString(venue) && (
                            <ListItem key='book-ven'>
                              <Text as='span' fontWeight='bold'>
                                Venue:{' '}
                              </Text>
                              {venue}
                            </ListItem>
                          )}

                          {checkerString(date) && (
                            <ListItem key='book-date'>
                              <Text as='span' fontWeight='bold'>
                                Date:{' '}
                              </Text>
                              {date}
                            </ListItem>
                          )}

                          {checkerString(timeSlots) && (
                            <ListItem key='book-times'>
                              <Text as='span' fontWeight='bold'>
                                Timeslot(s):{' '}
                              </Text>
                              {timeSlots}
                            </ListItem>
                          )}

                          {checkerString(userName) && (
                            <ListItem key='book-name'>
                              <Text as='span' fontWeight='bold'>
                                Contact Name:{' '}
                              </Text>
                              {userName}
                            </ListItem>
                          )}

                          {checkerString(email) && (
                            <ListItem key='book-email'>
                              <Text as='span' fontWeight='bold'>
                                Contact Email:{' '}
                              </Text>
                              {email}
                            </ListItem>
                          )}

                          {checkerString(cca) && (
                            <ListItem key='book-cca'>
                              <Text as='span' fontWeight='bold'>
                                CCA:{' '}
                              </Text>
                              {cca}
                            </ListItem>
                          )}

                          {checkerString(purpose) && (
                            <ListItem key='book-purp'>
                              <Text as='span' fontWeight='bold'>
                                Purpose:{' '}
                              </Text>
                              {purpose}
                            </ListItem>
                          )}

                          {checkerString(status) && (
                            <ListItem key='book-status'>
                              <Text as='span' fontWeight='bold'>
                                Status:{' '}
                              </Text>
                              {status}
                            </ListItem>
                          )}

                          {checkerString(reason) && (
                            <ListItem key='book-reason'>
                              <Text as='span' fontWeight='bold'>
                                Rejected Reason:{' '}
                              </Text>
                              {reason}
                            </ListItem>
                          )}
                        </List>
                      </Box>

                      {(isAdmin as boolean) &&
                        (isBookingRequest as boolean) &&
                        (conflict === null || conflict === undefined) &&
                        loadingData && (
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

                      {(isAdmin as boolean) &&
                        (isBookingRequest as boolean) &&
                        conflict.length > 0 &&
                        !loadingData && (
                          <Box w='full' overflow='auto'>
                            <Text
                              fontSize={{ base: '16px', lg: '18px' }}
                              fontWeight='500'
                              textTransform='uppercase'
                              mb='4'
                            >
                              Conflicting Requests
                            </Text>
                            <TableWidget
                              id='conflicting-request-bookingModal'
                              columns={columns}
                              data={conflict}
                              controlledPageCount={pageCount}
                              dataHandler={null}
                            />
                          </Box>
                        )}

                      {(isAdmin as boolean) &&
                        (isBookingRequest as boolean) &&
                        (conflict === null || conflict === undefined) &&
                        loadingData && (
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

                      {(isAdmin as boolean) &&
                        (isBookingRequest as boolean) &&
                        (conflict === null || conflict === undefined) &&
                        !loadingData && (
                          <Box overflow='auto'>
                            <Text
                              fontSize={{ base: '16px', lg: '18px' }}
                              fontWeight='500'
                              textTransform='uppercase'
                              mb='4'
                            >
                              Conflicting Requests{' '}
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
            </Box>
          </SimpleGrid>
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
