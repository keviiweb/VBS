import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Box,
  Button,
  Flex,
  List,
  ListItem,
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

import TableWidget from '@components/sys/misc/TableWidget';

import { Result } from 'types/api';
import { Venue } from 'types/vbs/venue';
import { checkerNumber, checkerString } from '@constants/sys/helper';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * A modal for the Venue.
 *
 * All information regarding the venue is displayed,
 * including its child venues if any
 *
 * @param param0 Modal functions such as isOpen, onClose
 * @returns A Modal displaying Venue information
 */
export default function VenueModal({ isOpen, onClose, modalData }) {
  const [loadingData, setLoadingData] = useState(true);

  const [id, setID] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [childVenue, setChildVenue] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [isAvailable, setIsAvailable] = useState('');
  const [instantBook, setInstantBook] = useState('');
  const [childVenues, setChildVenues] = useState<Venue[] | null>(null);

  const pageIndexDB = useRef(0);
  const pageSizeDB = useRef(10);

  const onTableChange = useCallback(({ pageIndex, pageSize }) => {
    pageIndexDB.current = pageIndex;
    pageSizeDB.current = pageSize;
  }, []);

  const reset = () => {
    setID('');
    setName('');
    setDescription('');
    setOpeningHours('');
    setChildVenue('');
    setCapacity(0);
    setIsAvailable('');
    setInstantBook('');
    setChildVenues(null);
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const processChildVenue = async (parentVenueID: string) => {
    try {
      const rawResponse = await fetch('/api/venue/child', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venue: parentVenueID,
        }),
      });
      const content: Result = await rawResponse.json();
      if (content.status && content.msg.length > 0) {
        setChildVenues(content.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function setupData(modalDataField: Venue) {
      if (modalDataField.id && checkerString(modalDataField.id)) {
        setID(modalDataField.id);
      } else {
        setID('');
      }

      if (modalDataField.name && checkerString(modalDataField.name)) {
        setName(modalDataField.name);
      } else {
        setName('');
      }

      if (
        modalDataField.description &&
        checkerString(modalDataField.description)
      ) {
        setDescription(modalDataField.description);
      } else {
        setDescription('');
      }

      if (
        modalDataField.openingHours &&
        checkerString(modalDataField.openingHours)
      ) {
        setOpeningHours(modalDataField.openingHours);
      } else {
        setOpeningHours('');
      }

      if (modalDataField.capacity && checkerNumber(modalDataField.capacity)) {
        setCapacity(modalDataField.capacity);
      } else {
        setCapacity(0);
      }

      if (
        modalDataField.childVenue &&
        checkerString(modalDataField.childVenue)
      ) {
        setChildVenue(modalDataField.childVenue);
      } else {
        setChildVenue('');
      }

      if (
        modalDataField.isAvailable &&
        checkerString(modalDataField.isAvailable)
      ) {
        setIsAvailable(modalDataField.isAvailable);
      } else {
        setIsAvailable('');
      }

      if (
        modalDataField.instantBook &&
        checkerString(modalDataField.instantBook)
      ) {
        setInstantBook(modalDataField.instantBook);
      } else {
        setInstantBook('');
      }

      if (!modalDataField.isChildVenue && modalDataField.id) {
        await processChildVenue(modalDataField.id);
      }

      setLoadingData(false);
    }

    if (modalData) {
      setupData(modalData);
    }
  }, [modalData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Opening Hours',
        accessor: 'openingHours',
      },
      {
        Header: 'Capacity',
        accessor: 'capacity',
      },
      {
        Header: 'Instant Book',
        accessor: 'instantBook',
      },
      {
        Header: 'Available for Booking',
        accessor: 'isAvailable',
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
            minChildWidth={{ base: 'full', md: 'full' }}
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
                          Venue Details
                        </Text>

                        <List spacing={5}>
                          {checkerString(id) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Venue ID:
                              </Text>{' '}
                              {id}
                            </ListItem>
                          )}
                          {checkerString(name) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Name:
                              </Text>{' '}
                              {name}
                            </ListItem>
                          )}
                          {checkerString(description) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Description:
                              </Text>{' '}
                              {description}
                            </ListItem>
                          )}
                          {checkerString(openingHours) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Opening Hours:
                              </Text>{' '}
                              {openingHours}
                            </ListItem>
                          )}
                          {checkerNumber(capacity) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Capacity:
                              </Text>{' '}
                              {capacity}
                            </ListItem>
                          )}
                          {checkerString(childVenue) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Child Venue:
                              </Text>{' '}
                              {childVenue}
                            </ListItem>
                          )}
                          {checkerString(instantBook) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Instant Book:
                              </Text>{' '}
                              {instantBook}
                            </ListItem>
                          )}
                          {checkerString(isAvailable) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Available for Booking:
                              </Text>{' '}
                              {isAvailable}
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Stack>
                  </Stack>
                </Flex>
              )}
            </MotionBox>
            <MotionBox variants={cardVariant} key='3'>
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
              >
                {childVenues && loadingData && (
                  <Box overflow='scroll'>
                    <Text
                      fontSize={{ base: '16px', lg: '18px' }}
                      fontWeight='500'
                      textTransform='uppercase'
                      mb='4'
                    >
                      Child Venues
                    </Text>
                    <Text>Loading Please wait...</Text>
                  </Box>
                )}

                {childVenues && !loadingData && (
                  <Box w='full' overflow='auto'>
                    <Text
                      fontSize={{ base: '16px', lg: '18px' }}
                      fontWeight='500'
                      textTransform='uppercase'
                      mb='4'
                    >
                      Child Venues
                    </Text>
                    <TableWidget
                      key={2}
                      columns={columns}
                      data={childVenues}
                      controlledPageCount={
                        childVenues.length % pageSizeDB.current === 0
                          ? Math.floor(childVenues.length / pageSizeDB.current)
                          : Math.floor(
                            childVenues.length / pageSizeDB.current,
                          ) + 1
                      }
                      dataHandler={onTableChange}
                    />
                  </Box>
                )}
              </Flex>
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
