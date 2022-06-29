import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormLabel,
  FormControl,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  SimpleGrid,
  Select,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { cardVariant, parentVariant } from '@root/motion';
import { InfoIcon } from '@chakra-ui/icons';
import { CCASession } from 'types/cca/ccaSession';

import { checkerString } from '@constants/sys/helper';
import { timeSlots } from '@constants/sys/timeslot';
import { convertDateToUnix, isValidDate } from '@root/src/constants/sys/date';
import moment from 'moment';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function SessionEditModal({ isOpen, onClose, modalData }) {
  const toast = useToast();

  const [loadingData, setLoadingData] = useState(true);

  const [errorMsg, setError] = useState('');

  const sessionIDDB = useRef('');

  const [ccaName, setCCAName] = useState('');
  const [dateStr, setDateStr] = useState('');
  const dateStrDB = useRef('');

  const [optional, setOptional] = useState(false);
  const optionalDB = useRef(false);

  const [endTimeDropdown, setEndTimeDropdown] = useState<JSX.Element[]>([]);
  const [startTimeDropdown, setStartTimeDropdown] = useState<JSX.Element[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const startTimeDB = useRef('');
  const endTimeDB = useRef('');

  const optionalText: string = `Hours from optional sessions will act as bonus hours ie they will not affect the total number of hours.
      Example: Yunus has attended 10 out of 12 hours. 
      If he attends a 3 hour optional session, his attendance will be boosted to 12 out of 12 hours`;

  const reset = () => {
    setDateStr('');
    setCCAName('');
    setOptional(false);
    setEndTimeDropdown([]);
    setStartTimeDropdown([]);
    setStartTime('');
    setEndTime('');

    startTimeDB.current = '';
    endTimeDB.current = '';
    optionalDB.current = false;
    dateStrDB.current = '';
    sessionIDDB.current = '';
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const validateFieldsEdit = (
    idField: string,
    dateField: string,
    startTimeField: string,
    endTimeField: string,
  ) => {
    if (!checkerString(idField)) {
      setError('Please select an event!');
      return false;
    }

    if (!checkerString(startTimeField)) {
      setError('Please set a start time!');
      return false;
    }

    if (!checkerString(endTimeField)) {
      setError('Please set an end time!');
      return false;
    }

    const day = new Date(dateField);

    if (!isValidDate(day)) {
      setError('Incorrect date format');
      return false;
    }

    if (Number(endTimeField) <= Number(startTimeField)) {
      setError('End date cannot be earlier than start date!');
      return false;
    }

    return true;
  };

  const handleClick = () => {
    if (
      validateFieldsEdit(
        sessionIDDB.current,
        dateStrDB.current,
        startTimeDB.current,
        endTimeDB.current,
      )
    ) {
      const data: CCASession = modalData as CCASession;
      data.date = convertDateToUnix(dateStrDB.current);
      data.dateStr = dateStrDB.current;
      data.time = `${startTimeDB.current} - ${endTimeDB.current}`;
      data.optional = optionalDB.current;
      data.optionalStr = optionalDB.current ? 'Yes' : 'No';

      const startH = `${startTimeDB.current
        .toString()
        .slice(0, 2)}:${startTimeDB.current.slice(2)}:00`;
      const endH = `${endTimeDB.current
        .toString()
        .slice(0, 2)}:${endTimeDB.current.slice(2)}:00`;

      const startTimeM = moment(startH, 'HH:mm:ss');
      const endTimeM = moment(endH, 'HH:mm:ss');
      const duration = moment.duration(endTimeM.diff(startTimeM));
      const hours = duration.asHours();

      data.duration = hours;

      console.log(data);
    }
  };

  const onStartTimeChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      startTimeDB.current = value;
      setStartTime(value);
    }
  };

  const onEndTimeChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      endTimeDB.current = value;
      setEndTime(value);
    }
  };

  const handleOptionalHover = () => {
    toast.closeAll();

    toast({
      description: optionalText,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const generateTimeSlots = useCallback(async () => {
    const start: JSX.Element[] = [];
    const end: JSX.Element[] = [];

    start.push(<option key='start' value='' aria-label='Default' />);
    end.push(<option key='end' value='' aria-label='Default' />);

    for (let key = 0; key <= Object.keys(timeSlots).length; key += 1) {
      if (timeSlots[key]) {
        const dataField: string = timeSlots[key];
        start.push(
          <option key={`start${key}`} value={dataField}>
            {dataField}
          </option>,
        );

        end.push(
          <option key={`end${key}`} value={dataField}>
            {dataField}
          </option>,
        );
      }
    }

    setStartTimeDropdown(start);
    setEndTimeDropdown(end);
  }, []);

  useEffect(() => {
    async function setupData(modalDataField: CCASession) {
      setLoadingData(true);

      const idField: string =
        modalDataField && modalDataField.id ? modalDataField.id : '';
      sessionIDDB.current = idField;

      const dateStrField: string =
        modalDataField && modalDataField.dateStr ? modalDataField.dateStr : '';
      const ccaNameField: string =
        modalDataField && modalDataField.ccaName ? modalDataField.ccaName : '';

      setDateStr(dateStrField);
      dateStrDB.current = dateStrField;

      setCCAName(ccaNameField);

      const split: string[] =
        modalDataField && modalDataField.time
          ? modalDataField.time.split('-')
          : [' - '];
      const start: string = split[0].trim();
      const end: string = split[1].trim();

      startTimeDB.current = start;
      endTimeDB.current = end;
      setStartTime(start);
      setEndTime(end);

      const opt: boolean =
        modalDataField && modalDataField.optional
          ? modalDataField.optional
          : false;
      setOptional(opt);

      setLoadingData(false);
      await generateTimeSlots();
    }

    if (modalData) {
      setupData(modalData);
    }
  }, [modalData, generateTimeSlots]);

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
          <Stack spacing={5} w='full' align='center'>
            <Box>
              <Text
                mt={2}
                mb={6}
                textTransform='uppercase'
                fontSize={{ base: '2xl', sm: '2xl', lg: '3xl' }}
                lineHeight='5'
                fontWeight='bold'
                letterSpacing='tight'
                color='gray.900'
              >
                {ccaName}
              </Text>
            </Box>
          </Stack>

          <MotionSimpleGrid
            mt='3'
            minChildWidth={{ base: 'full', md: '500px', lg: '800px' }}
            spacing='2em'
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <Progress hasStripe value={25} />

            <MotionBox variants={cardVariant} key='2'>
              {modalData && !loadingData && (
                <Flex
                  w='full'
                  h='full'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Stack spacing={10}>
                    <Stack
                      w={{ base: 'full', md: '500px', lg: '500px' }}
                      direction='row'
                    >
                      <FormControl id='date'>
                        <FormLabel>
                          <Text
                            w={40}
                            textTransform='uppercase'
                            lineHeight='5'
                            fontWeight='bold'
                            letterSpacing='tight'
                            mr={5}
                          >
                            Date
                          </Text>
                        </FormLabel>
                        <Input
                          type='date'
                          placeholder='Date'
                          value={dateStr}
                          size='lg'
                          onChange={(event) => {
                            setDateStr(event.currentTarget.value);
                            dateStrDB.current = event.currentTarget.value;
                          }}
                        />
                      </FormControl>
                    </Stack>
                    {startTimeDropdown && (
                      <Stack w={{ base: 'full', md: '500px', lg: '500px' }}>
                        <FormLabel>
                          <Text
                            w={40}
                            textTransform='uppercase'
                            lineHeight='5'
                            fontWeight='bold'
                            letterSpacing='tight'
                            mr={5}
                          >
                            Start Time
                          </Text>
                        </FormLabel>
                        <Select
                          value={startTime}
                          onChange={onStartTimeChange}
                          size='md'
                        >
                          {endTimeDropdown}
                        </Select>
                      </Stack>
                    )}

                    {endTimeDropdown && (
                      <Stack w={{ base: 'full', md: '500px', lg: '500px' }}>
                        <FormLabel>
                          <Text
                            w={40}
                            textTransform='uppercase'
                            lineHeight='5'
                            fontWeight='bold'
                            letterSpacing='tight'
                            mr={5}
                          >
                            End Time
                          </Text>
                        </FormLabel>
                        <Select
                          value={endTime}
                          onChange={onEndTimeChange}
                          size='md'
                        >
                          {endTimeDropdown}
                        </Select>
                      </Stack>
                    )}

                    <Stack spacing={5} direction='row'>
                      <Checkbox
                        isChecked={optional}
                        onChange={(event) => {
                          setOptional(event.target.checked);
                          optionalDB.current = event.target.checked;
                        }}
                      >
                        Optional Session
                      </Checkbox>
                      <InfoIcon onMouseEnter={handleOptionalHover} />
                    </Stack>

                    {checkerString(errorMsg) && (
                      <Stack align='center'>
                        <Text>{errorMsg}</Text>
                      </Stack>
                    )}
                  </Stack>
                </Flex>
              )}
            </MotionBox>
          </MotionSimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button
            bg='red.400'
            color='white'
            w='150px'
            size='lg'
            _hover={{ bg: 'red.600' }}
            onClick={handleClick}
          >
            Next
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
