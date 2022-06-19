import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { cardVariant, parentVariant } from '@root/motion';
import { prettifyDate } from '@constants/sys/date';
import moment from 'moment-timezone';
import Loading from './Loading';

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
  const dateParsed = useRef(null);

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
    if (timeSlotsField.length === 0) {
      return false;
    }

    for (let key = 0; key < timeSlotsField.length; key += 1) {
      if (timeSlotsField[key]) {
        if (timeSlotsField[key].id) {
          return true;
        }
      }
    }

    return false;
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
    selectedVenue.current = '';
    dateParsed.current = '';

    setID('');
    setName('');
    setDescription('');
    setOpeningHours('');
    setCapacity('');
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const displayVenue = (venue) => {
    if (id && venue === id) {
      return `${name} (Whole Venue)`;
    }
    if (rawChildVenue) {
      for (let key = 0; key < rawChildVenue.length; key += 1) {
        if (rawChildVenue[key].id === venue) {
          return rawChildVenue[key].name;
        }
      }
    }

    return '';
  };

  const handleSubmit = () => {
    setError(null);
    if (
      validateFields(
        selectedVenue.current,
        dateParsed.current,
        selectedTimeSlots.current,
      )
    ) {
      dataHandler(
        selectedVenue.current,
        displayVenue(selectedVenue.current),
        selectedTimeSlots.current,
        dateParsed.current,
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

      for (let key = 0; key < content.length; key += 1) {
        selection.push(
          <option key={content[key].id} value={content[key].id}>
            {content[key].name}
          </option>,
        );
      }
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
          if (content.status && content.msg.length > 0) {
            setRawChildVenue(content.msg);
            await buildChildVenueDropdown(content.msg);
            setHasChildVenue(true);
          }

          return true;
        } catch (error) {
          return false;
        }
      }

      return true;
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
    for (let key = 0; key < slots.length; key += 1) {
      if (Object.prototype.hasOwnProperty.call(slots, key)) {
        if (slots[key]) {
          counter += 1;
        }
      }
    }
    return counter;
  };

  const displaySlots = (slots) => {
    if (slots) {
      setDisplayedVenue(displayVenue(selectedVenue.current));
      let text = 'Selected timeslot(s): ';
      let counter = 0;
      const total = countSlots(slots);
      if (slots) {
        for (let key = 0; key < slots.length; key += 1) {
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
        }
        const time = total * 30;
        text += ` (${time} minutes)`;
      }

      setDisplayedSlots(text);
    } else {
      setDisplayedSlots(null);
    }
  };

  const handleClickTimeSlots = async (idField) => {
    setError(null);

    if (idField) {
      const slots = selectedTimeSlots.current;
      if (rawSlots.current) {
        if (slots[idField]) {
          slots[idField] = null;
        } else {
          slots[idField] = rawSlots.current[idField];
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
        for (let key = 0; key < content.length; key += 1) {
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
                    handleClick={null}
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
        }
      } catch (error) {
        return false;
      }
    }

    setTimeSlots(buttons);
    return true;
  };

  const handleDate = async (dateObj: Date) => {
    setError(null);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;

    rawDate.current = dateObj;

    if (dateObj) {
      setDisplayedSlots(null);
      selectedTimeSlots.current = [];
      const prettified = prettifyDate(dateObj);
      date.current = prettified;
      const dateYYMMDD: string = moment
        .tz(formattedDate, 'YYYY-MM-DD', true, 'Asia/Singapore')
        .format('YYYY-MM-DD');
      dateParsed.current = dateYYMMDD;
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
            date: dateYYMMDD,
          }),
        });
        const content = await rawResponse.json();
        rawSlots.current = content;
        buildTimeSlot(content);

        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
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
          <Text>Description: {description}</Text>
          <Text>Opening Hours: {openingHours}</Text>
          <Text>Capacity: {capacity}</Text>
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
                    <Box>
                      <Stack align='center'>
                        <Box>{selectedDate}</Box>
                        <Box mb={5}>Select Timeslot(s)</Box>
                        <Stack direction={['column', 'row']} align='center'>
                          <ButtonGroup display='flex' flexWrap='wrap'>
                            {timeSlots}
                          </ButtonGroup>
                        </Stack>
                      </Stack>
                    </Box>
                  </Box>
                )}

                {!selectedDate && !timeSlots && (
                  <Box>
                    <Stack spacing={600} align='center'>
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
                    <Box>
                      <Stack align='center'>
                        <Box>{selectedDate}</Box>
                        <Box mb={5}>Select Timeslot(s)</Box>
                        <Box>
                          <Loading message='Fetching all timeslots...' />
                        </Box>
                      </Stack>
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
                  <Text>Venue: {displayedVenue}</Text>
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
