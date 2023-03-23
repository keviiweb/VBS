import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ButtonGroup,
  Button,
  Box,
  Flex,
  Heading,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  useToast,
  useBreakpointValue,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import CalendarWidget from '@components/sys/vbs/CalendarWidget';
import TimeSlotButton from '@components/sys/vbs/TimeSlotButton';
import Loading from '@components/sys/misc/Loading';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { motion } from 'framer-motion';
import { cardVariant, parentVariant } from '@root/motion';
import moment from 'moment-timezone';

import { isValidDate, prettifyDate } from '@constants/sys/date';
import { checkerArray, checkerString, PERSONAL } from '@constants/sys/helper';

import { type Venue } from 'types/vbs/venue';
import { type TimeSlot } from 'types/vbs/timeslot';
import { type Result } from 'types/api';
import { type CCA } from 'types/cca/cca';
import { type BookingRequest } from '@root/src/types/vbs/bookingReq';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const levels = {
  SELECT_VENUE: 0,
  CONFIRM: 1,
};

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
  modalData,
  calendarMin,
  calendarMax,
}) {
  const toast = useToast();

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
    modalData !== undefined && modalData !== null
      ? modalData.isChildVenue !== null &&
        modalData.isChilVenue !== undefined &&
        modalData.isChildVenue
      : false;

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

  const [progressLevel, setProgressLevel] = useState(levels.SELECT_VENUE);

  // Confirmation Modal
  const [venueConfirm, setVenueConfirm] = useState('');
  const [dateConfirm, setDateConfirm] = useState('');
  const [timeSlotsConfirm, setTimeSlotsConfirm] = useState('');
  const [purposeConfirm, setPurposeConfirm] = useState('');
  const [typeConfirm, setTypeConfirm] = useState('1');
  const [errorMsgConfirm, setErrorConfirm] = useState('');
  const [successConfirm, setSuccessBookingConfirm] = useState(false);
  const [ccaSelectionConfirm, setCCASelectionConfirm] = useState('');

  const [ccaListConfirm, setCCAListConfirm] = useState<JSX.Element[]>([]);
  const [showCCAsConfirm, setShowCCAsConfirm] = useState(false);
  const CCALISTConfirm = useRef<CCA[]>([]);

  const [isSwitchConfirm, setIsSwitchConfirm] = useState(false);
  const isSwitchDBConfirm = useRef(false);

  const venueNameDBConfirm = useRef('');
  const venueDBConfirm = useRef('');
  const timeSlotsDBConfirm = useRef<TimeSlot[]>([]);
  const typeDBConfirm = useRef(PERSONAL);
  const purposeDBConfirm = useRef('');

  const dateParsedConfirm = useRef('');

  const [submittingConfirm, setSubmittingConfirm] = useState(false);

  const timeoutsConfirm = useRef<NodeJS.Timeout[]>([]);

  const variantDesktop = useBreakpointValue({ base: 'none', md: 'flex' });
  const variantMobile = useBreakpointValue({ base: 'flex', md: 'none' });

  const reset = () => {
    changeDate('');

    date.current = '';
    rawDate.current = null;
    dateParsed.current = '';

    setID('');
    setName('');
    setDescription('');
    setOpeningHours('');
    setCapacity('');
    setHasChildVenue(false);
    setChildVenueDrop([]);
    setRawChildVenue([]);
    setDisplayedVenue('');

    selectedVenue.current = '';

    setTimeSlots([]);
    setDisplayedSlots('');
    rawVenue.current = [];
    selectedTimeSlots.current = [];
    rawSlots.current = [];

    setError('');
    setSubmitButtonPressed(false);
    setProgressLevel(levels.SELECT_VENUE);

    setVenueConfirm('');
    setDateConfirm('');
    setTimeSlotsConfirm('');
    setPurposeConfirm('');
    setTypeConfirm('1');
    setErrorConfirm('');
    setSuccessBookingConfirm(false);
    setCCASelectionConfirm('');
    setCCAListConfirm([]);
    setShowCCAsConfirm(false);
    setIsSwitchConfirm(false);

    CCALISTConfirm.current = [];

    isSwitchDBConfirm.current = false;
    venueNameDBConfirm.current = '';
    venueDBConfirm.current = '';
    timeSlotsDBConfirm.current = [];
    typeDBConfirm.current = PERSONAL;
    purposeDBConfirm.current = '';
    dateParsedConfirm.current = '';

    setSubmittingConfirm(false);
    timeoutsConfirm.current = [];
  };

  const check = (timeSlotsField: TimeSlot[]) => {
    if (timeSlotsField.length === 0) {
      return false;
    }

    for (let key = 0; key < timeSlotsField.length; key += 1) {
      if (
        timeSlotsField[key] !== undefined &&
        timeSlotsField[key] !== null &&
        timeSlotsField[key].id !== null &&
        timeSlotsField[key].id !== undefined
      ) {
        return true;
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

  const validateFieldsConfirm = (
    venueField: string,
    venueNameField: string,
    dateField: string,
    timeSlotsField: TimeSlot[],
    typeField: string,
    purposeField: string,
  ) => {
    // super basic validation here
    if (!checkerString(dateField) || !isValidDate(new Date(dateField))) {
      setErrorConfirm('No date found');
      return false;
    }

    if (!checkerString(venueField)) {
      setErrorConfirm('No venues found');
      return false;
    }

    if (!checkerString(venueNameField)) {
      setErrorConfirm('No venues found');
      return false;
    }

    if (timeSlotsField.length === 0 || !check(timeSlotsField)) {
      setErrorConfirm('No timeslots found');
      return false;
    }

    if (!checkerString(typeField)) {
      setErrorConfirm('No type found');
      return false;
    }

    if (typeField !== PERSONAL) {
      let found = false;

      for (let i = 0; i < CCALISTConfirm.current.length; i += 1) {
        if (typeField === CCALISTConfirm.current[i].id) {
          found = true;
        }
      }

      if (!found) {
        setErrorConfirm('Not valid CCA');
        return false;
      }
    }

    if (!checkerString(purposeField)) {
      setErrorConfirm('Please write a purpose for the booking.');
      return false;
    }

    setErrorConfirm('');
    return true;
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const submitBookingRequest = async (
    venueIDField: string,
    venueNameField: string,
    dateField: string,
    timeSlotsField: TimeSlot[],
    typeField: string,
    purposeField: string,
  ) => {
    setSubmittingConfirm(true);
    try {
      const rawResponse = await fetch('/api/bookingReq/create', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venue: venueIDField,
          venueName: venueNameField,
          date: dateField,
          timeSlots: timeSlotsField,
          type: typeField,
          purpose: purposeField,
        }),
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        setSubmittingConfirm(false);
        setSuccessBookingConfirm(true);

        for (let key = 0; key < timeoutsConfirm.current.length; key += 1) {
          const t = timeoutsConfirm.current[key];
          clearTimeout(t);
        }

        const time = setTimeout(() => {
          handleModalCloseButton();
        }, 5000);

        timeoutsConfirm.current.push(time);
      } else {
        toast({
          title: 'Error',
          description: content.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setSuccessBookingConfirm(false);
        setSubmittingConfirm(false);
        setIsSwitchConfirm(false);
        isSwitchDBConfirm.current = false;
      }
    } catch (error) {
      setSubmittingConfirm(false);
      setSuccessBookingConfirm(false);
    }
  };

  const handleSubmit = async () => {
    setErrorConfirm('');
    if (!isSwitchDBConfirm.current) {
      setErrorConfirm('Please toggle the confirmation switch.');
      return;
    }

    if (
      validateFieldsConfirm(
        venueDBConfirm.current,
        venueNameDBConfirm.current,
        dateParsedConfirm.current,
        timeSlotsDBConfirm.current,
        typeDBConfirm.current,
        purposeDBConfirm.current,
      )
    ) {
      await submitBookingRequest(
        venueDBConfirm.current,
        venueNameDBConfirm.current,
        dateParsedConfirm.current,
        timeSlotsDBConfirm.current,
        typeDBConfirm.current,
        purposeDBConfirm.current,
      );
    }
  };

  const displayVenue = (venue: string): string => {
    if (checkerString(id) && venue === id) {
      return `${name} (Whole Venue)`;
    }

    if (rawChildVenue.length > 0) {
      const rawChild: Venue[] = rawChildVenue;
      for (let key = 0; key < rawChild.length; key += 1) {
        const ven: Venue = rawChild[key];
        if (ven.id === venue) {
          return ven.name;
        }
      }
    }

    return '';
  };

  const buildText = async (
    venueNameField: string,
    dateParsedField: string,
    timeSlotsField: TimeSlot[],
  ) => {
    setVenueConfirm(venueNameField);
    setDateConfirm(dateParsedField);
    let str = '';
    for (let key = 0; key < timeSlotsField.length; key += 1) {
      if (
        timeSlotsField[key] !== undefined &&
        timeSlotsField[key] !== null &&
        timeSlotsField[key].slot !== undefined
      ) {
        str += `\n${timeSlotsField[key].slot}`;
      }
    }

    setTimeSlotsConfirm(str);
  };

  const fetchPendingCount = async (
    venueField: string,
    dateParsedField: string,
    timeSlotsField: TimeSlot[],
  ) => {
    setSubmitButtonPressed(true);
    try {
      const rawResponse = await fetch('/api/bookingReq/pending', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venue: venueField,
          date: dateParsedField,
          timeSlots: timeSlotsField,
        }),
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        const bookRequest: BookingRequest[] = content.msg;
        if (bookRequest.length > 0) {
          toast.closeAll();

          toast({
            title: 'Info',
            description: `There are currently ${bookRequest.length} pending request(s) with one or more same timeslots`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
    setSubmitButtonPressed(false);
  };

  const handleClick = async (next: boolean) => {
    if (progressLevel === levels.SELECT_VENUE) {
      if (
        validateFields(
          selectedVenue.current,
          dateParsed.current,
          selectedTimeSlots.current,
        )
      ) {
        venueNameDBConfirm.current = displayVenue(selectedVenue.current);
        venueDBConfirm.current = selectedVenue.current;
        timeSlotsDBConfirm.current = selectedTimeSlots.current;
        dateParsedConfirm.current = dateParsed.current;

        await buildText(
          venueNameDBConfirm.current,
          dateParsedConfirm.current,
          timeSlotsDBConfirm.current,
        );

        await fetchPendingCount(
          venueDBConfirm.current,
          dateParsedConfirm.current,
          timeSlotsDBConfirm.current,
        );

        if (next) {
          setProgressLevel(levels.CONFIRM);
        }
      }
    } else if (progressLevel === levels.CONFIRM) {
      if (!next) {
        setProgressLevel(levels.SELECT_VENUE);
      }
    }
  };

  const buildChildVenueDropdown = useCallback(
    async (content: Venue[]) => {
      const selection: JSX.Element[] = [];
      rawVenue.current = [];

      if (modalData !== null && modalData !== undefined) {
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

  const buildCCAList = async () => {
    const selection: JSX.Element[] = [];
    setSubmitButtonPressed(true);
    try {
      const rawResponse = await fetch('/api/cca', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        if (content.msg !== null && content.msg !== undefined) {
          CCALISTConfirm.current = [];
          const ccaContent: CCA[] = content.msg;

          selection.push(<option key='' value='' aria-label='default' />);

          if (ccaContent.length > 0) {
            for (let key = 0; key < ccaContent.length; key += 1) {
              CCALISTConfirm.current.push({
                id: ccaContent[key].id,
                name: ccaContent[key].name,
              });
              selection.push(
                <option key={ccaContent[key].id} value={ccaContent[key].id}>
                  {ccaContent[key].name}
                </option>,
              );
            }
          }

          setCCAListConfirm(selection);
        }
      }
    } catch (error) {
      console.error(error);
    }
    setSubmitButtonPressed(false);
  };

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

      await buildCCAList();
    }

    if (modalData !== null && modalData !== undefined) {
      selectedVenue.current = modalData.id !== undefined ? modalData.id : '';
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
      if (
        slots !== null &&
        slots !== undefined &&
        (Object.prototype.hasOwnProperty.call(slots, key) as boolean)
      ) {
        if (slots[key].slot !== undefined) {
          counter += 1;
        }
      }
    }
    return counter;
  };

  const displaySlots = (slots: TimeSlot[]) => {
    if (slots.length > 0) {
      setDisplayedVenue(displayVenue(selectedVenue.current));
      let text: string = 'Selected timeslot(s): ';
      let counter: number = 0;
      const total: number = countSlots(slots);

      if (slots.length > 0) {
        for (let key = 0; key < slots.length; key += 1) {
          if (slots[key] !== null && slots[key] !== undefined) {
            if (slots[key].slot !== undefined) {
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

    if (idField !== null && idField !== undefined) {
      const slots: TimeSlot[] = selectedTimeSlots.current;
      if (rawSlots.current.length > 0) {
        const rawS: TimeSlot[] = rawSlots.current;
        const slot: TimeSlot = rawS[idField];

        if (
          slot !== null &&
          slot !== undefined &&
          slot.booked !== undefined &&
          !slot.booked
        ) {
          if (slots[idField] !== undefined && slots[idField].id !== undefined) {
            slots[idField] = {
              id: undefined,
              slot: undefined,
              booked: undefined,
            };
          } else if (
            slots[idField] === undefined ||
            slots[idField].id === undefined
          ) {
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
          if (
            content !== null &&
            content !== undefined &&
            (Object.prototype.hasOwnProperty.call(content, key) as boolean)
          ) {
            const newID: string = `${selectedVenue.current}${date.current}${key}`;
            if (content[key] !== null && content[key] !== undefined) {
              if (
                content[key].booked !== undefined &&
                content[key].booked !== null &&
                !(content[key].booked as boolean)
              ) {
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
  const onChildVenueChange = async (event: { target: { value: string; }; }) => {
    setError('');

    try {
      if (event.target.value !== undefined) {
        selectedVenue.current = event.target.value;

        if (rawDate.current !== null) {
          if (isValidDate(rawDate.current)) {
            await handleDate(rawDate.current);
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

  const setTypeHelper = (event: any) => {
    try {
      if (event !== undefined) {
        if (event.cancelable as boolean) {
          event.preventDefault();
        }

        if (Number(event) === 2) {
          typeDBConfirm.current = '';
          setShowCCAsConfirm(true);
        } else {
          typeDBConfirm.current = PERSONAL;
          setShowCCAsConfirm(false);
        }

        setTypeConfirm(event);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onCCASelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    try {
      if (event.target.value !== undefined) {
        typeDBConfirm.current = event.target.value;
        setCCASelectionConfirm(event.target.value);
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
            onClose={() => {
              setSubmitButtonPressed(false);
            }}
          />

          <Box
            display={progressLevel === levels.SELECT_VENUE ? 'block' : 'none'}
          >
            <Text>Description: {description}</Text>
            <Text>Opening Hours: {openingHours}</Text>
            <Text>Capacity: {capacity}</Text>
            {hasChildVenue && childVenueDrop.length > 0 && (
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
                  {checkerString(selectedDate) && timeSlots.length > 0 && (
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

                  {!checkerString(selectedDate) && timeSlots.length === 0 && (
                    <Box>
                      <Stack spacing={600} align='center'>
                        <Text>Please select a date</Text>
                      </Stack>
                    </Box>
                  )}

                  {checkerString(selectedDate) && timeSlots.length === 0 && (
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

            {checkerString(displayedSlots) && (
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
          </Box>

          <Box display={progressLevel === levels.CONFIRM ? 'block' : 'none'}>
            {submittingConfirm && (
              <Box>
                <Loading message='Submitting request...' />
              </Box>
            )}

            {successConfirm && !submittingConfirm && (
              <Box textAlign='center' py={10} px={6}>
                <CheckCircleIcon boxSize='50px' color='green.500' />
                <Heading as='h2' size='xl' mt={6} mb={2}>
                  Booking request submitted!
                </Heading>
                <Text color='gray.500'>
                  Please wait a few days for the admin to approve your request..
                </Text>
                <Text color='gray.500'>
                  The page will be closed after 5 seconds...
                </Text>
              </Box>
            )}

            {!successConfirm && !submittingConfirm && (
              <MotionSimpleGrid
                mt='3'
                minChildWidth='250px'
                spacing='2em'
                minH='full'
                variants={parentVariant}
                initial='initial'
                animate='animate'
              >
                <MotionBox variants={cardVariant} key='cca-confirm'>
                  <Flex align='center' justify='center' mt={-10}>
                    <Stack spacing={8} mx='auto' maxW='lg' py={12} px={6}>
                      <Stack align='center'>
                        <Heading fontSize='3xl'>Confirm your booking</Heading>
                        {checkerString(errorMsgConfirm) && (
                          <Text>{errorMsgConfirm}</Text>
                        )}
                      </Stack>
                      <Box rounded='lg' boxShadow='lg' p={8}>
                        <Stack spacing={3}>
                          <Text fontSize='xl'>Venue: {venueConfirm}</Text>
                          <Text fontSize='xl'>Date: {dateConfirm}</Text>
                          <Text fontSize='xl'>
                            Timeslot: {timeSlotsConfirm}
                          </Text>
                          <RadioGroup
                            onChange={setTypeHelper}
                            value={typeConfirm}
                            name={venueConfirm}
                          >
                            <Stack direction='row'>
                              <Radio value='1'>{PERSONAL}</Radio>
                              {ccaListConfirm.length > 0 && (
                                <Radio value='2'>CCA</Radio>
                              )}
                            </Stack>
                          </RadioGroup>

                          {showCCAsConfirm && ccaListConfirm.length > 0 && (
                            <Select
                              onChange={onCCASelectionChange}
                              value={ccaSelectionConfirm}
                              size='sm'
                            >
                              {ccaListConfirm}
                            </Select>
                          )}

                          <InputGroup display={variantDesktop}>
                            <InputLeftAddon>Purpose </InputLeftAddon>
                            <Textarea
                              isRequired
                              value={purposeConfirm}
                              onChange={(event) => {
                                if (event.cancelable) {
                                  event.preventDefault();
                                }
                                setPurposeConfirm(event.currentTarget.value);
                                purposeDBConfirm.current =
                                  event.currentTarget.value;
                              }}
                              placeholder='Enter your purpose'
                            />
                          </InputGroup>

                          <InputGroup display={variantMobile}>
                            <Stack>
                              <Text>Purpose </Text>
                              <Textarea
                                isRequired
                                value={purposeConfirm}
                                onChange={(event) => {
                                  if (event.cancelable) {
                                    event.preventDefault();
                                  }
                                  setPurposeConfirm(event.currentTarget.value);
                                  purposeDBConfirm.current =
                                    event.currentTarget.value;
                                }}
                                placeholder='Enter your purpose'
                              />
                            </Stack>
                          </InputGroup>
                        </Stack>
                      </Box>

                      <Stack direction='row'>
                        <Text mr={8}>
                          I have confirmed that the details are correct
                        </Text>
                        <Switch
                          isRequired
                          checked={isSwitchConfirm}
                          onChange={(event) => {
                            setIsSwitchConfirm(event.target.checked);
                            isSwitchDBConfirm.current = event.target.checked;
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Flex>
                </MotionBox>
              </MotionSimpleGrid>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          {progressLevel !== levels.SELECT_VENUE &&
            !successConfirm &&
            !submittingConfirm && (
              <Button
                key='previous-button'
                bg='blue.400'
                color='white'
                w='150px'
                size='lg'
                _hover={{ bg: 'blue.600' }}
                mr={5}
                onClick={async () => {
                  await handleClick(false);
                }}
              >
                Previous
              </Button>
            )}

          {progressLevel !== levels.CONFIRM &&
            !successConfirm &&
            !submittingConfirm && (
              <Button
                key='next-button'
                bg='blue.400'
                color='white'
                w='150px'
                size='lg'
                _hover={{ bg: 'blue.600' }}
                onClick={async () => {
                  await handleClick(true);
                }}
              >
                Next
              </Button>
            )}

          {progressLevel === levels.CONFIRM &&
            !successConfirm &&
            !submittingConfirm && (
              <Button
                key='submit-button'
                disabled={!isSwitchConfirm}
                bg='red.400'
                color='white'
                w='150px'
                size='lg'
                _hover={{ bg: 'red.600' }}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
