import {
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
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
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { cardVariant, parentVariant } from '@root/motion';
import Loading from '@components/sys/vbs/Loading';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function VenueBookingModalConfirmation({
  isOpen,
  onClose,
  modalData,
}) {
  // display
  const [venue, setVenue] = useState(null);
  const [date, setDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState(null);
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [type, setType] = useState('1');
  const [errorMsg, setError] = useState(null);
  const [success, setSuccessBooking] = useState(false);
  const [ccaSelection, setCCASelection] = useState('');

  const [ccaList, setCCAList] = useState(null);
  const [showCCAs, setShowCCAs] = useState(false);
  const CCALIST = useRef([]);

  const [isSwitch, setIsSwitch] = useState(false);
  const toast = useToast();

  // variable for db
  const emailDB = useRef(null);
  const venueNameDB = useRef(null);
  const venueDB = useRef(null);
  const dateDB = useRef(null);
  const timeSlotsDB = useRef(null);
  const typeDB = useRef('PERSONAL');
  const purposeDB = useRef(null);

  const [submitting, setSubmitting] = useState(false);

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

  const validateFields = (
    emailField,
    venueField,
    venueNameField,
    dateField,
    timeSlotsField,
    typeField,
    purposeField,
  ) => {
    // super basic validation here
    if (emailField) {
      if (!emailField.includes('@u.nus.edu')) {
        setError('Please use your school email.');
        return false;
      }
    } else {
      setError('Please include an email.');
      return false;
    }

    if (!dateField) {
      setError('No date found');
      return false;
    }

    if (!venueField) {
      setError('No venues found');
      return false;
    }

    if (!venueNameField) {
      setError('No venues found');
      return false;
    }

    if (!timeSlotsField || !check(timeSlotsField)) {
      setError('No timeslots found');
      return false;
    }

    if (typeField) {
      if (typeField !== 'PERSONAL') {
        let found = false;

        Object.keys(CCALIST.current).forEach((i) => {
          if (typeField === CCALIST.current[i].id) {
            found = true;
          }
        });

        if (!found) {
          setError('Not valid CCA');
          return false;
        }
      }
    } else {
      setError('No type found');
      return false;
    }

    if (!purposeField) {
      setError('Please write a purpose for the booking.');
      return false;
    }

    setError(null);
    return true;
  };

  const reset = () => {
    setVenue(null);
    setDate(null);
    setTimeSlots(null);
    setEmail('');
    setPurpose('');
    setType('1');
    setError(null);
    setCCAList(null);
    setShowCCAs(false);
    setSuccessBooking(false);
    setIsSwitch(false);

    emailDB.current = null;
    venueNameDB.current = null;
    venueDB.current = null;
    dateDB.current = null;
    timeSlotsDB.current = null;
    typeDB.current = 'PERSONAL';
    purposeDB.current = null;
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const submitBookingRequest = async (
    emailReq,
    venueIDReq,
    venueNameReq,
    dateReq,
    timeSlotsReq,
    typeReq,
    purposeReq,
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
          email: emailReq,
          venue: venueIDReq,
          venueName: venueNameReq,
          date: dateReq,
          timeSlots: timeSlotsReq,
          type: typeReq,
          purpose: purposeReq,
        }),
      });
      const content = await rawResponse.json();
      if (content.status) {
        setSubmitting(false);
        setSuccessBooking(true);
        setTimeout(() => {
          handleModalCloseButton();
        }, 5000);
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
      }
    } catch (error) {
      setSubmitting(false);
      setSuccessBooking(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!isSwitch) {
      setError('Please toggle the confirmation switch.');
      return;
    }

    if (
      validateFields(
        emailDB.current,
        venueDB.current,
        venueNameDB.current,
        dateDB.current,
        timeSlotsDB.current,
        typeDB.current,
        purposeDB.current,
      )
    ) {
      await submitBookingRequest(
        emailDB.current,
        venueDB.current,
        venueNameDB.current,
        dateDB.current,
        timeSlotsDB.current,
        typeDB.current,
        purposeDB.current,
      );
    }

    /*
    setTimeout(() => {
      reset();
      onClose();
    }, 200); */
  };

  const buildText = async (modalDataField) => {
    setVenue(modalDataField.venueName);
    setDate(modalDataField.date);

    let str = '';
    Object.keys(modalDataField.timeSlots).forEach((key) => {
      if (modalDataField.timeSlots[key]) {
        str += `\n${modalDataField.timeSlots[key].slot}`;
      }
    });

    setTimeSlots(str);
  };

  const buildCCAList = async () => {
    const selection = [];

    try {
      const rawResponse = await fetch('/api/cca', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content = await rawResponse.json();
      if (content.length > 0) {
        CCALIST.current = [];

        Object.keys(content).forEach((key) => {
          if (content[key]) {
            CCALIST.current.push({
              id: content[key].id,
              name: content[key].name,
            });
            selection.push(
              <option key={content[key].id} value={content[key].id}>
                {content[key].name}
              </option>,
            );
          }
        });

        setCCAList(selection);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    async function fetchData() {
      await buildText(modalData);
      await buildCCAList();
      venueNameDB.current = modalData ? modalData.venueName : null;
      venueDB.current = modalData ? modalData.venue : null;
      dateDB.current = modalData ? modalData.date : null;
      timeSlotsDB.current = modalData ? modalData.timeSlots : null;
    }

    if (modalData) {
      fetchData();
    }
  }, [modalData]);

  const setTypeHelper = (event) => {
    if (event) {
      if (event === 2) {
        typeDB.current = CCALIST.current[0].id;
        setShowCCAs(true);
      } else {
        typeDB.current = 'PERSONAL';
        setShowCCAs(false);
      }

      setType(event);
    }
  };

  const onCCASelectionChange = (event) => {
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
        <ModalCloseButton />
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
                        <Text fontSize='xl'>
                          Venue:
                          {venue}
                        </Text>
                        <Text fontSize='xl'>
                          Date:
                          {date}
                        </Text>
                        <Text fontSize='xl'>
                          Timeslot:
                          {timeSlots}
                        </Text>
                        <RadioGroup
                          onChange={(event) => setTypeHelper(event)}
                          value={type}
                          name={venue}
                        >
                          <Stack direction='row'>
                            <Radio value='1'>Personal</Radio>
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
                          <InputLeftAddon>Email </InputLeftAddon>
                          <Input
                            isRequired
                            value={email}
                            onChange={(event) => {
                              setEmail(event.currentTarget.value);
                              emailDB.current = event.currentTarget.value;
                            }}
                            type='email'
                            placeholder='Enter your email here'
                          />
                        </InputGroup>
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
                        I have confirmed that the details are correct
                      </Text>
                      <Switch
                        isRequired
                        value={isSwitch}
                        onChange={setIsSwitch}
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
