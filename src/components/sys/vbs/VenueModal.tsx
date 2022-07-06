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

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VenueModal({ isOpen, onClose, modalData }) {
  const [loadingData, setLoadingData] = useState(true);

  const [id, setID] = useState(null);
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [openingHours, setOpeningHours] = useState(null);
  const [childVenue, setChildVenue] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  const [instantBook, setInstantBook] = useState(null);
  const [childVenues, setChildVenues] = useState<Venue[] | null>(null);

  const pageIndexDB = useRef(0);
  const pageSizeDB = useRef(10);

  const onTableChange = useCallback(({ pageIndex, pageSize }) => {
    pageIndexDB.current = pageIndex;
    pageSizeDB.current = pageSize;
  }, []);

  const reset = () => {
    setID(null);
    setName(null);
    setDescription(null);
    setOpeningHours(null);
    setChildVenue(null);
    setCapacity(null);
    setIsAvailable(null);
    setInstantBook(null);
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
    async function setupData() {
      setID(modalData.id);
      setName(modalData.name);
      setDescription(modalData.description);
      setOpeningHours(modalData.openingHours);
      setCapacity(modalData.capacity);
      setChildVenue(modalData.childVenue);
      setIsAvailable(modalData.isAvailable);
      setInstantBook(modalData.instantBook);

      if (!modalData.isChildVenue && modalData.id) {
        await processChildVenue(modalData.id);
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
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Venue ID:
                            </Text>{' '}
                            {id}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Name:
                            </Text>{' '}
                            {name}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Description:
                            </Text>{' '}
                            {description}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Opening Hours:
                            </Text>{' '}
                            {openingHours}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Capacity:
                            </Text>{' '}
                            {capacity}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Child Venue:
                            </Text>{' '}
                            {childVenue}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Instant Book:
                            </Text>{' '}
                            {instantBook}
                          </ListItem>
                          <ListItem>
                            <Text as='span' fontWeight='bold'>
                              Available for Booking:
                            </Text>{' '}
                            {isAvailable}
                          </ListItem>
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
                  <Box overflow='scroll'>
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
