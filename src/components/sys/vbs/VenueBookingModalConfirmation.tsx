import React, { useState, useEffect, useRef } from 'react';
import {
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
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { cardVariant, parentVariant } from '@root/motion';

import Loading from '@components/sys/misc/Loading';

import { checkerString, checkerNumber, PERSONAL } from '@constants/sys/helper';
import { TimeSlot } from 'types/vbs/timeslot';
import { isValidDate } from '@constants/sys/date';
import { Result } from 'types/api';
import { CCA } from 'types/cca/cca';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Renders a confirmation modal in the Venue Booking process.
 *
 * When user press the submit button, a request is sent to the backend to create
 * a venue booking request
 *
 * The modal will automatically close once the request is successful, or displays an error message otherwise
 *
 * @param param0 Modal functions such as isOpen, onClose and BookingRequest information
 * @returns A confirmation modal that is displayed to the user
 */
export default function VenueBookingModalConfirmation({
  isOpen,
  onClose,
  modalData,
}) {
  // display
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [timeSlots, setTimeSlots] = useState('');
  const [purpose, setPurpose] = useState('');
  const [type, setType] = useState('1');
  const [errorMsg, setError] = useState('');
  const [success, setSuccessBooking] = useState(false);
  const [ccaSelection, setCCASelection] = useState('');

  const [ccaList, setCCAList] = useState<JSX.Element[]>([]);
  const [showCCAs, setShowCCAs] = useState(false);
  const CCALIST = useRef<CCA[]>([]);

  const [isSwitch, setIsSwitch] = useState(false);
  const isSwitchDB = useRef(false);

  const toast = useToast();

  // variable for db
  const venueNameDB = useRef('');
  const venueDB = useRef('');
  const timeSlotsDB = useRef<TimeSlot[]>([]);
  const typeDB = useRef(PERSONAL);
  const purposeDB = useRef('');

  const dateParsed = useRef('');

  const [submitting, setSubmitting] = useState(false);

  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const check = (timeSlotsField: TimeSlot[]): boolean => {
    if (timeSlotsField.length === 0) {
      return false;
    }

    for (let key = 0; key < timeSlotsField.length; key += 1) {
      if (timeSlotsField[key]) {
        const slot: TimeSlot | null = timeSlotsField[key];
        if (slot.id !== undefined) {
          if (!checkerNumber(slot.id)) {
            return false;
          }
        }
      }
    }

    return true;
  };

  const validateFields = (
    venueField: string,
    venueNameField: string,
    dateField: string,
    timeSlotsField: TimeSlot[],
    typeField: string,
    purposeField: string,
  ) => {
    // super basic validation here
    if (!checkerString(dateField) || !isValidDate(new Date(dateField))) {
      setError('No date found');
      return false;
    }

    if (!checkerString(venueField)) {
      setError('No venues found');
      return false;
    }

    if (!checkerString(venueNameField)) {
      setError('No venues found');
      return false;
    }

    if (timeSlotsField === [] || !check(timeSlotsField)) {
      setError('No timeslots found');
      return false;
    }

    if (!checkerString(typeField)) {
      setError('No type found');
      return false;
    }

    if (typeField !== PERSONAL) {
      let found = false;

      for (let i = 0; i < CCALIST.current.length; i += 1) {
        if (typeField === CCALIST.current[i].id) {
          found = true;
        }
      }

      if (!found) {
        setError('Not valid CCA');
        return false;
      }
    }

    if (!checkerString(purposeField)) {
      setError('Please write a purpose for the booking.');
      return false;
    }

    setError('');
    return true;
  };

  const reset = () => {
    setVenue('');
    setDate('');
    setTimeSlots('');
    setPurpose('');
    setType('1');
    setError('');
    setCCAList([]);
    setShowCCAs(false);
    setSuccessBooking(false);
    setIsSwitch(false);
    setCCASelection('');

    venueNameDB.current = '';
    venueDB.current = '';
    timeSlotsDB.current = [];
    typeDB.current = PERSONAL;
    purposeDB.current = '';
    isSwitchDB.current = false;
  };

  const handleModalCloseButton = () => {
    for (let key = 0; key < timeouts.current.length; key += 1) {
      const t = timeouts.current[key];
      clearTimeout(t);
    }

    const close = setTimeout(() => {
      reset();
      onClose();
    }, 200);

    timeouts.current.push(close);
  };

  const submitBookingRequest = async (
    venueIDField: string,
    venueNameField: string,
    dateField: string,
    timeSlotsField: TimeSlot[],
    typeField: string,
    purposeField: string,
  ) => {
    setSubmitting(true);
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
        setSubmitting(false);
        setSuccessBooking(true);

        for (let key = 0; key < timeouts.current.length; key += 1) {
          const t = timeouts.current[key];
          clearTimeout(t);
        }

        const time = setTimeout(() => {
          handleModalCloseButton();
        }, 5000);

        timeouts.current.push(time);
      } else {
        toast({
          title: 'Error',
          description: content.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setSuccessBooking(false);
        setSubmitting(false);
        setIsSwitch(false);
        isSwitchDB.current = false;
      }
    } catch (error) {
      setSubmitting(false);
      setSuccessBooking(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!isSwitchDB.current) {
      setError('Please toggle the confirmation switch.');
      return;
    }

    if (
      validateFields(
        venueDB.current,
        venueNameDB.current,
        dateParsed.current,
        timeSlotsDB.current,
        typeDB.current,
        purposeDB.current,
      )
    ) {
      await submitBookingRequest(
        venueDB.current,
        venueNameDB.current,
        dateParsed.current,
        timeSlotsDB.current,
        typeDB.current,
        purposeDB.current,
      );
    }
  };

  const buildText = async (modalDataField: {
    venueName: string;
    dateParsed: string;
    timeSlots: TimeSlot[];
  }) => {
    setVenue(modalDataField.venueName);
    setDate(modalDataField.dateParsed);
    let str = '';
    for (let key = 0; key < modalDataField.timeSlots.length; key += 1) {
      if (modalDataField.timeSlots[key]) {
        if (modalDataField.timeSlots[key].slot !== undefined) {
          str += `\n${modalDataField.timeSlots[key].slot}`;
        }
      }
    }

    setTimeSlots(str);
  };

  const buildCCAList = async () => {
    const selection: JSX.Element[] = [];
    try {
      const rawResponse = await fetch('/api/cca', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status && content.msg.length > 0) {
        CCALIST.current = [];
        const ccaContent: CCA[] = content.msg;

        selection.push(<option key='' value='' aria-label='default' />);

        for (let key = 0; key < ccaContent.length; key += 1) {
          if (ccaContent[key]) {
            CCALIST.current.push({
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

        setCCAList(selection);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (
        modalData.venueName !== null &&
        modalData.venue !== null &&
        modalData.timeSlots !== null &&
        modalData.dateParsed !== null
      ) {
        await buildText(modalData);
        await buildCCAList();
        venueNameDB.current = modalData ? modalData.venueName : null;
        venueDB.current = modalData ? modalData.venue : null;
        timeSlotsDB.current = modalData ? modalData.timeSlots : null;
        dateParsed.current = modalData ? modalData.dateParsed : null;
      }
    }

    if (modalData) {
      fetchData();
    }
  }, [modalData]);

  const setTypeHelper = (event) => {
    if (event) {
      if (Number(event) === 2) {
        typeDB.current = '';
        setShowCCAs(true);
      } else {
        typeDB.current = PERSONAL;
        setShowCCAs(false);
      }

      setType(event);
    }
  };

  const onCCASelectionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    typeDB.current = event.target.value;
    setCCASelection(event.target.value);
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
        {!submitting && <ModalCloseButton />}
        <ModalHeader />
        <ModalBody>
          {submitting && (
            <Box>
              <Loading message='Submitting request...' />
            </Box>
          )}

          {success && !submitting && (
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

          {!success && !submitting && venue && date && timeSlots && (
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
                <Flex align='center' justify='center' mt={-10}>
                  <Stack spacing={8} mx='auto' maxW='lg' py={12} px={6}>
                    <Stack align='center'>
                      <Heading fontSize='3xl'>Confirm your booking</Heading>
                      {errorMsg && <Text>{errorMsg}</Text>}
                    </Stack>
                    <Box rounded='lg' boxShadow='lg' p={8}>
                      <Stack spacing={3}>
                        <Text fontSize='xl'>Venue: {venue}</Text>
                        <Text fontSize='xl'>Date: {date}</Text>
                        <Text fontSize='xl'>Timeslot: {timeSlots}</Text>
                        <RadioGroup
                          onChange={setTypeHelper}
                          value={type}
                          name={venue}
                        >
                          <Stack direction='row'>
                            <Radio value='1'>{PERSONAL}</Radio>
                            <Radio value='2'>CCA</Radio>
                          </Stack>
                        </RadioGroup>

                        {showCCAs && ccaList && (
                          <Select
                            onChange={onCCASelectionChange}
                            value={ccaSelection}
                            size='sm'
                          >
                            {ccaList}
                          </Select>
                        )}

                        <InputGroup>
                          <InputLeftAddon>Purpose </InputLeftAddon>
                          <Textarea
                            isRequired
                            value={purpose}
                            onChange={(event) => {
                              setPurpose(event.currentTarget.value);
                              purposeDB.current = event.currentTarget.value;
                            }}
                            placeholder='Enter your purpose'
                          />
                        </InputGroup>
                      </Stack>
                    </Box>

                    <Stack direction='row'>
                      <Text mr={8}>
                        I have confirmed that the details are correct{' '}
                      </Text>
                      <Switch
                        isRequired
                        checked={isSwitch}
                        onChange={(event) => {
                          setIsSwitch(event.target.checked);
                          isSwitchDB.current = event.target.checked;
                        }}
                      />
                    </Stack>
                  </Stack>
                </Flex>
              </MotionBox>
            </MotionSimpleGrid>
          )}
        </ModalBody>
        <ModalFooter>
          {!success && !submitting && (
            <Button
              disabled={!isSwitch}
              bg='cyan.700'
              color='white'
              w='150px'
              size='lg'
              onClick={handleSubmit}
              _hover={{ bg: 'cyan.800' }}
            >
              Submit
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
