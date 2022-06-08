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
} from '@chakra-ui/react';
import CalendarWidget from '@components/sys/vbs/CalendarWidget';
import TimeSlotButton from '@components/sys/vbs/TimeSlotButton';

import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cardVariant, parentVariant } from '@root/motion';
import { prettifyDate } from '@constants/sys/helper';
import Loading from '@components/sys/vbs/Loading';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VenueBookingModal({
  isOpen,
  onClose,
  dataHandler,
  modalData,
  calendarMin,
  calendarMax,
}) {
  const [selectedDate, changeDate] = useState(null);
  const date = useRef(null);
  const rawDate = useRef(null);

  const [id, setID] = useState('');
  const [name, setName] = useState('Venue');
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [capacity, setCapacity] = useState('');
  const isChildVenue =
    modalData && modalData.isChildVenue ? modalData.isChildVenue : false;

  const [hasChildVenue, setHasChildVenue] = useState(false);
  const [childVenueDrop, setChildVenueDrop] = useState(null);
  const [rawChildVenue, setRawChildVenue] = useState([]);
  const [displayedVenue, setDisplayedVenue] = useState(null);
  const selectedVenue = useRef('');

  const [timeSlots, setTimeSlots] = useState([]);
  const [displayedSlots, setDisplayedSlots] = useState(null);

  const rawSlots = useRef([]);
  const selectedTimeSlots = useRef([]);

  const [errorMsg, setError] = useState(null);

  const check = (timeSlotsField) => {
    let checkResult = false;

    if (timeSlotsField.length === 0) {
      return false;
    }

    Object.keys(timeSlotsField).forEach((key) => {
      if (timeSlotsField[key] && timeSlotsField[key].id) {
        checkResult = true;
      }
    });

    return checkResult;
  };

  const validateFields = (venueField, dateField, timeSlotsField) => {
    // simple validation for now
    if (!venueField) {
      setError('Please select a venue');
      return false;
    }

    if (!dateField) {
      setError('Please select a date');
      return false;
    }

    if (!timeSlotsField || !check(timeSlotsField)) {
      setError('Please select your timeslot(s)');
      return false;
    }

    setError(null);
    return true;
  };

  const reset = () => {
    changeDate(null);
    setHasChildVenue(false);
    setChildVenueDrop(null);
    setRawChildVenue([]);
    setDisplayedVenue(null);
    setDisplayedSlots(null);
    setTimeSlots([]);
    setError(null);
    selectedTimeSlots.current = [];
    rawSlots.current = [];
    selectedVenue.current = [];

    setID('');
    setName('');
    setDescription('');
    setOpeningHours('');
    setCapacity('');
  };

  const displayVenue = (venue) => {
    if (id && venue === id) {
      return `${name} (Whole Venue)`;
    }
    if (rawChildVenue) {
      let nameResult = '';

      Object.keys(rawChildVenue).forEach((key) => {
        if (rawChildVenue[key].id === venue) {
          nameResult = rawChildVenue[key].name;
        }
      });

      return nameResult;
    }

    return '';
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const handleSubmit = () => {
    setError(null);
    if (
      validateFields(
        selectedVenue.current,
        date.current,
        selectedTimeSlots.current,
      )
    ) {
      dataHandler(
        selectedVenue.current,
        displayVenue(selectedVenue.current),
        date.current,
        selectedTimeSlots.current,
      );

      setTimeout(() => {
        reset();
        onClose();
      }, 200);
    }
  };

  const buildChildVenueDropdown = useCallback(
    async (content) => {
      const selection = [];
      if (modalData) {
        selection.push(
          <option key={modalData.id} value={modalData.id}>
            Whole Venue
          </option>,
        );
      }

      Object.keys(content).forEach((key) => {
        if (content[key]) {
          selection.push(
            <option key={content[key].id} value={content[key].id}>
              {content[key].name}
            </option>,
          );
        }
      });

      setChildVenueDrop(selection);
    },
    [modalData],
  );

  useEffect(() => {
    async function fetchData() {
      if (!isChildVenue) {
        try {
          const rawResponse = await fetch('/api/venue/child', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ venue: selectedVenue.current }),
          });
          const content = await rawResponse.json();
          if (content.length > 0) {
            setRawChildVenue(content);
            await buildChildVenueDropdown(content);
            setHasChildVenue(true);
          }

          return true;
        } catch (error) {
          return false;
        }
      }

      return false;
    }

    if (modalData) {
      selectedVenue.current = modalData && modalData.id ? modalData.id : '';
      setID(modalData.id);
      setName(modalData.name);
      setDescription(modalData.description);
      setOpeningHours(modalData.openingHours);
      setCapacity(modalData.capacity);
      fetchData();
    }
  }, [buildChildVenueDropdown, modalData, isChildVenue]);

  const countSlots = (slots) => {
    let counter = 0;

    Object.keys(slots).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(slots, key)) {
        if (slots[key]) {
          counter += 1;
        }
      }
    });

    return counter;
  };

  const displaySlots = (slots) => {
    if (slots) {
      setDisplayedVenue(displayVenue(selectedVenue.current));
      let text = 'Selected timeslot(s): ';
      let counter = 0;
      const total = countSlots(slots);
      if (slots) {
        Object.keys(slots).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(slots, key)) {
            if (slots[key]) {
              counter += 1;
              if (counter !== total) {
                text += ` ${slots[key].slot} ,`;
              } else {
                text += ` ${slots[key].slot} `;
              }
            }
          }
        });

        const time = total * 30;
        text += ` (${time} minutes)`;
      }

      setDisplayedSlots(text);
    } else {
      setDisplayedSlots(null);
    }
  };

  const handleClickTimeSlots = async (idTime) => {
    setError(null);

    if (idTime) {
      const slots = selectedTimeSlots.current;
      if (rawSlots.current) {
        if (slots[idTime]) {
          slots[idTime] = null;
        } else {
          slots[idTime] = rawSlots.current[idTime];
        }
      }
      selectedTimeSlots.current = slots;
      displaySlots(slots);
    }
  };

  const buildTimeSlot = (content) => {
    const buttons = [];
    if (content) {
      try {
        Object.keys(content).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(content, key)) {
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
                  />,
                );
              } else {
                buttons.push(
                  <TimeSlotButton
                    disable
                    key={newID}
                    newKey={newID}
                    id={key}
                    slot={content[key].slot}
                  />,
                );
              }
            }
          }
        });
      } catch (error) {
        return false;
      }
    }

    setTimeSlots(buttons);
    return true;
  };

  const handleDate = async (dateObj) => {
    setError(null);
    rawDate.current = dateObj;
    if (dateObj && dateObj !== new Date()) {
      setDisplayedSlots(null);
      selectedTimeSlots.current = [];
      const prettified = prettifyDate(dateObj);
      date.current = prettified;
      changeDate(prettified);
      try {
        const rawResponse = await fetch('/api/timeslot', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            venue: selectedVenue.current,
            date: dateObj,
          }),
        });
        const content = await rawResponse.json();
        rawSlots.current = content;
        buildTimeSlot(content);
      } catch (error) {
        return false;
      }
    }

    return true;
  };

  // Child venue generation
  const onChildVenueChange = (event) => {
    setError(null);

    if (event.target.value) {
      selectedVenue.current = event.target.value;
      handleDate(rawDate.current);
      selectedTimeSlots.current = [];
      displaySlots(null);
    }
  };

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
        <ModalHeader>{name}</ModalHeader>
        <ModalBody>
          <Text>
            Description:
            {' ' + description}
          </Text>
          <Text>
            Opening Hours:
            {' ' + openingHours}
          </Text>
          <Text>
            Capacity:
            {' ' + capacity}
          </Text>
          {hasChildVenue && childVenueDrop && (
            <Box>
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
                bg='white'
                rounded='xl'
                shadow='lg'
                borderWidth='1px'
                m='4'
              >
                <Stack spacing={5} w='full' align='center'>
                  <Text>Select Venue</Text>
                  <Select onChange={onChildVenueChange} size='sm'>
                    {childVenueDrop}
                  </Select>
                </Stack>
              </Flex>
            </Box>
          )}

          <MotionSimpleGrid
            mt='3'
            minChildWidth='250px'
            spacing='2em'
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <CalendarWidget
              selectedDate={handleDate}
              calendarMin={calendarMin}
              calendarMax={calendarMax}
            />
            <MotionBox variants={cardVariant} key='2'>
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
                bg='white'
                rounded='xl'
                shadow='lg'
                borderWidth='1px'
              >
                {selectedDate && timeSlots && (
                  <Box
                    w='100%'
                    h='full'
                    position='relative'
                    overflow='hidden'
                    roundedTop='lg'
                  >
                    <Box align='center'>
                      <Box>{selectedDate}</Box>
                      <Box mb={5}>Select Timeslot(s)</Box>
                      <Stack direction={['column', 'row']} align='center'>
                        <ButtonGroup display='flex' flexWrap='wrap'>
                          {timeSlots}
                        </ButtonGroup>
                      </Stack>
                    </Box>
                  </Box>
                )}

                {!selectedDate && !timeSlots && (
                  <Box spacing={600}>
                    <Stack spacing={5} align='center'>
                      <Text>Please select a date</Text>
                    </Stack>
                  </Box>
                )}

                {selectedDate && !timeSlots && (
                  <Box
                    w='100%'
                    h='full'
                    position='relative'
                    overflow='hidden'
                    roundedTop='lg'
                  >
                    <Box align='center'>
                      <Box>{selectedDate}</Box>
                      <Box mb={5}>Select Timeslot(s)</Box>
                      <Box>
                        <Loading message='Fetching all timeslots...' />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Flex>
            </MotionBox>
          </MotionSimpleGrid>

          {displayedSlots && (
            <Box>
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
                bg='white'
                rounded='xl'
                shadow='lg'
                borderWidth='1px'
                m='4'
              >
                <Stack align='center'>
                  <Text>
                    Venue:
                    {' ' + displayedVenue}
                  </Text>
                  <Text>{displayedSlots}</Text>
                </Stack>
              </Flex>
            </Box>
          )}

          {errorMsg && (
            <Box>
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
                bg='white'
                rounded='xl'
                shadow='lg'
                borderWidth='1px'
                m='4'
              >
                <Stack align='center'>
                  <Text>{errorMsg}</Text>
                </Stack>
              </Flex>
            </Box>
          )}
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
