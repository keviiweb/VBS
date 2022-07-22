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
import Loading from '@components/sys/misc/Loading';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { motion } from 'framer-motion';
import { cardVariant, parentVariant } from '@root/motion';
import moment from 'moment-timezone';

import { isValidDate, prettifyDate } from '@constants/sys/date';
import { checkerArray, checkerString } from '@constants/sys/helper';

import { Venue } from 'types/vbs/venue';
import { TimeSlot } from 'types/vbs/timeslot';
import { Result } from 'types/api';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Renders a modal that represents the data flow in creating a Venue Booking Request
 *
 * 1. First the user selects the Date, then the timeslots are fetched and generated for the user.
 * 2. Booked timeslots are blanked out, while available timeslots are clickable
 * 3. The user can then choose the selected timeslots and click next to be redirected to the ConfirmationModal
 */
export default function VenueBookingModal({
  isOpen,
  onClose,
  dataHandler,
  modalData,
  calendarMin,
  calendarMax,
}) {
  const [selectedDate, changeDate] = useState('');
  const date = useRef('');
  const rawDate = useRef<Date | null>(null);
  const dateParsed = useRef('');

  const [id, setID] = useState('');
  const [name, setName] = useState('Venue');
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [capacity, setCapacity] = useState('');
  const isChildVenue: boolean =
    modalData && modalData.isChildVenue ? modalData.isChildVenue : false;

  const [hasChildVenue, setHasChildVenue] = useState(false);
  const [childVenueDrop, setChildVenueDrop] = useState<JSX.Element[]>([]);
  const [rawChildVenue, setRawChildVenue] = useState<Venue[]>([]);
  const [displayedVenue, setDisplayedVenue] = useState('');
  const selectedVenue = useRef('');

  const [timeSlots, setTimeSlots] = useState<JSX.Element[]>([]);
  const [displayedSlots, setDisplayedSlots] = useState('');

  const rawVenue = useRef<Venue[]>([]);
  const rawSlots = useRef<TimeSlot[]>([]);
  const selectedTimeSlots = useRef<TimeSlot[]>([]);

  const [errorMsg, setError] = useState('');
  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const check = (timeSlotsField: TimeSlot[]) => {
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

  const validateFields = (
    venueField: string,
    dateField: string,
    timeSlotsField: TimeSlot[],
  ) => {
    // simple validation for now
    if (!checkerString(venueField)) {
      setError('Please select a venue');
      return false;
    }

    if (!checkerString(dateField)) {
      setError('Please select a date');
      return false;
    }

    if (timeSlotsField === null || !check(timeSlotsField)) {
      setError('Please select your timeslot(s)');
      return false;
    }

    setError('');
    return true;
  };

  const reset = () => {
    changeDate('');
    setHasChildVenue(false);
    setChildVenueDrop([]);
    setRawChildVenue([]);
    setDisplayedVenue('');
    setDisplayedSlots('');
    setTimeSlots([]);
    setError('');
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

  const displayVenue = (venue: string): string => {
    if (id && venue === id) {
      return `${name} (Whole Venue)`;
    }

    if (rawChildVenue) {
      const rawChild: Venue[] = rawChildVenue as Venue[];
      for (let key = 0; key < rawChild.length; key += 1) {
        const ven: Venue = rawChild[key];
        if (ven.id === venue) {
          return ven.name;
        }
      }
    }

    return '';
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
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
    async (content: Venue[]) => {
      const selection: JSX.Element[] = [];
      rawVenue.current = [];

      if (modalData) {
        selection.push(
          <option key={modalData.id} value={modalData.id}>
            Whole Venue
          </option>,
        );

        rawVenue.current.push(modalData);
      }

      for (let key = 0; key < content.length; key += 1) {
        const ven: Venue = content[key];
        selection.push(
          <option key={ven.id} value={ven.id}>
            {ven.name}
          </option>,
        );

        rawVenue.current.push(ven);
      }

      setChildVenueDrop(selection);
    },
    [modalData],
  );

  useEffect(() => {
    async function fetchData() {
      if (!isChildVenue) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/venue/child', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ venue: selectedVenue.current }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            const ven: Venue[] = content.msg;
            if (ven.length > 0) {
              setRawChildVenue(ven);
              await buildChildVenueDropdown(ven);
              setHasChildVenue(true);
            }
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
      }
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

  const countSlots = (slots: TimeSlot[]): number => {
    let counter: number = 0;
    for (let key = 0; key < slots.length; key += 1) {
      if (Object.prototype.hasOwnProperty.call(slots, key)) {
        if (slots[key]) {
          counter += 1;
        }
      }
    }
    return counter;
  };

  const displaySlots = (slots: TimeSlot[]) => {
    if (slots) {
      setDisplayedVenue(displayVenue(selectedVenue.current));
      let text: string = 'Selected timeslot(s): ';
      let counter: number = 0;
      const total: number = countSlots(slots);
      if (slots.length > 0) {
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
        const time: number = total * 30;
        text += ` (${time} minutes)`;
      }

      setDisplayedSlots(text);
    } else {
      setDisplayedSlots('');
    }
  };

  const handleClickTimeSlots = async (idField: number) => {
    setError('');

    if (idField) {
      const slots: TimeSlot[] = selectedTimeSlots.current;
      if (rawSlots.current) {
        const rawS: TimeSlot[] = rawSlots.current as TimeSlot[];
        const slot: TimeSlot = rawS[idField];
        if (!slot.booked) {
          if (slots[idField]) {
            slots[idField] = {
              id: undefined,
              slot: undefined,
              booked: undefined,
            };
          } else {
            slots[idField] = slot;
          }
        }
      }
      selectedTimeSlots.current = slots;
      displaySlots(slots);
    }
  };

  const buildTimeSlot = (content: TimeSlot[]) => {
    const buttons: JSX.Element[] = [];
    if (checkerArray(content)) {
      try {
        for (let key = 0; key < content.length; key += 1) {
          if (Object.prototype.hasOwnProperty.call(content, key)) {
            if (content[key]) {
              const newID: string = selectedVenue.current + date.current + key;
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
    setError('');
    const day: string = dateObj.getDate().toString().padStart(2, '0');
    const month: string = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year: number = dateObj.getFullYear();
    const formattedDate: string = `${year}-${month}-${day}`;

    rawDate.current = dateObj;

    if (isValidDate(dateObj)) {
      setDisplayedSlots('');
      selectedTimeSlots.current = [];
      const prettified: string = prettifyDate(dateObj);
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
        const content: Result = await rawResponse.json();
        if (content.status) {
          const timeS: TimeSlot[] = content.msg;
          rawSlots.current = timeS;
          buildTimeSlot(timeS);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Child venue generation
  const onChildVenueChange = (event: { target: { value: string } }) => {
    setError('');

    try {
      if (event && event.target.value) {
        selectedVenue.current = event.target.value;

        if (rawDate.current !== null) {
          if (isValidDate(rawDate.current)) {
            handleDate(rawDate.current);
            selectedTimeSlots.current = [];
            displaySlots([]);
          }
        }

        for (let key = 0; key < rawVenue.current.length; key += 1) {
          const ven: Venue = rawVenue.current[key];
          if (ven.id === event.target.value) {
            setDescription(ven.description);
            setCapacity(ven.capacity.toString());
            setOpeningHours(ven.openingHours);
            setName(ven.name);
          }
        }
      }
    } catch (error) {
      console.error(error);
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
          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />

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
            <MotionBox variants={cardVariant} key='timeslot-box'>
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
                {selectedDate && timeSlots.length > 0 && (
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

                {!selectedDate && timeSlots.length === 0 && (
                  <Box>
                    <Stack spacing={600} align='center'>
                      <Text>Please select a date</Text>
                    </Stack>
                  </Box>
                )}

                {selectedDate && timeSlots.length === 0 && (
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

          {checkerString(errorMsg) && (
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
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
