import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  FormLabel,
  FormControl,
  Input,
  List,
  ListItem,
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
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import LoadingModal from '@components/sys/misc/LoadingModal';
import SessionCreateConfirmationModal from '@components/sys/cca/SessionCreateConfirmationModal';

import { cardVariant, parentVariant } from '@root/motion';
import { InfoIcon } from '@chakra-ui/icons';
import { CCASession } from 'types/cca/ccaSession';
import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';

import { checkerNumber, checkerString } from '@constants/sys/helper';
import { timeSlots } from '@constants/sys/timeslot';
import {
  convertDateToUnix,
  isValidDate,
  calculateDuration,
  fetchCurrentDate,
  addDays,
  locale,
  dateISO,
} from '@root/src/constants/sys/date';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const levels = {
  TIME: 0,
  REMARKS: 1,
};

const progressBarLevel = {
  TIME: 50,
  REMARKS: 100,
};

/**
 * Renders a modal for the Session Create modal
 *
 * This modal consist of the entire workflow process of creating a session
 *
 * 1. The name, start time, end time is displayed and edited
 * 2. All members of the CCA is displayed for expected member section
 * 3. Redirect to confirmation modal
 *
 * @param param0 Modal functions
 * @returns A modal
 */
export default function SessionCreateModal({
  isOpen,
  onClose,
  modalData,
  threshold,
  dataHandler,
}) {
  const toast = useToast();

  const selectedData = useRef<CCASession | null>(null);
  const [confirmationData, setConfirmationData] = useState<CCASession | null>(
    null,
  );

  const [progressLevel, setProgressLevel] = useState(levels.TIME);
  const [progressBar, setProgressBar] = useState(progressBarLevel.TIME);
  const [loadingData, setLoadingData] = useState(true);

  const [errorMsg, setError] = useState('');

  const ccaIDDB = useRef('');

  const [dateStr, setDateStr] = useState('');
  const dateStrDB = useRef('');
  const [name, setName] = useState('');
  const nameDB = useRef('');

  const [optional, setOptional] = useState(false);
  const optionalDB = useRef(false);
  const optionalStrDB = useRef('');

  const [endTimeDropdown, setEndTimeDropdown] = useState<JSX.Element[]>([]);
  const [startTimeDropdown, setStartTimeDropdown] = useState<JSX.Element[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const startTimeDB = useRef('');
  const endTimeDB = useRef('');

  const [remarks, setRemarks] = useState('');
  const [ldrNotes, setLdrNotes] = useState('');

  const remarksDB = useRef('');
  const ldrNotesDB = useRef('');

  const optionalText: string = `Hours from optional sessions will act as bonus hours ie they will not affect the total number of hours.
      Example: Yunus has attended 10 out of 12 hours. 
      If he attends a 3 hour optional session, his attendance will be boosted to 12 out of 12 hours`;

  const expectedText: string =
    'Members who are expected to turn up for the session';

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const memberData = useRef<CCARecord[]>([]);

  const [startDateCalendar, setCalendarStartDate] = useState('');
  const [endDateCalendar, setCalendarEndDate] = useState('');

  const reset = () => {
    selectedData.current = null;
    setConfirmationData(null);

    setProgressLevel(levels.TIME);
    setProgressBar(progressBarLevel.TIME);
    setLoadingData(true);
    setError('');

    setDateStr('');
    setName('');
    setOptional(false);
    setStartTimeDropdown([]);
    setEndTimeDropdown([]);
    setStartTime('');
    setEndTime('');
    setRemarks('');
    setLdrNotes('');

    ccaIDDB.current = '';
    dateStrDB.current = '';
    nameDB.current = '';
    optionalDB.current = false;
    optionalStrDB.current = 'No';
    startTimeDB.current = '';
    endTimeDB.current = '';
    remarksDB.current = '';
    ldrNotesDB.current = '';

    setSubmitButtonPressed(false);
    setDisableButton(false);

    memberData.current = [];

    setCalendarStartDate('');
    setCalendarEndDate('');
  };

  const handleModalCloseButton = useCallback(async () => {
    setTimeout(async () => {
      setSubmitButtonPressed(true);
      await dataHandler();
      reset();
      onClose();
    }, 200);
  }, [dataHandler, onClose]);

  const validateFields = (
    nameField: string,
    dateField: string,
    startTimeField: string,
    endTimeField: string,
  ) => {
    if (!checkerString(nameField)) {
      setError('Please set a name!');
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
      setError('End time cannot be earlier than start time!');
      return false;
    }

    return true;
  };

  const validateFieldsSubmit = (selectedDataField: CCASession) => {
    if (!checkerString(selectedDataField.name)) {
      setError('Please set a name!');
      return false;
    }

    if (!checkerString(selectedDataField.time)) {
      setError('Please set a time!');
      return false;
    }

    if (
      selectedDataField.remarks !== undefined &&
      !checkerString(selectedDataField.remarks)
    ) {
      setError('Please set a remark!');
      return false;
    }

    if (
      selectedDataField.ldrNotes !== undefined &&
      !checkerString(selectedDataField.ldrNotes)
    ) {
      setError('Please set a note!');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (selectedData.current !== null) {
      const data: CCASession = selectedData.current;
      data.remarks = remarksDB.current;
      data.ldrNotes = ldrNotesDB.current;
      selectedData.current = data;

      if (validateFieldsSubmit(selectedData.current)) {
        setConfirmationData(selectedData.current);
      }
    }
  };

  const handleClick = async (next: boolean) => {
    if (progressLevel === levels.TIME) {
      if (selectedData.current !== null) {
        setError('');
        if (
          validateFields(
            nameDB.current,
            dateStrDB.current,
            startTimeDB.current,
            endTimeDB.current,
          )
        ) {
          const data: CCASession = selectedData.current;
          data.date = convertDateToUnix(dateStrDB.current);
          data.dateStr = dateStrDB.current;
          data.time = `${startTimeDB.current} - ${endTimeDB.current}`;
          data.optional = optionalDB.current;
          data.optionalStr = optionalStrDB.current;
          data.name = nameDB.current;

          data.duration = await calculateDuration(
            Number(startTimeDB.current),
            Number(endTimeDB.current),
          );

          selectedData.current = data;

          if (next) {
            setProgressLevel(levels.REMARKS);
            setProgressBar(progressBarLevel.REMARKS);
          }
        }
      }
    } else if (progressLevel === levels.REMARKS) {
      if (selectedData.current !== null) {
        setError('');
        const data: CCASession = selectedData.current;
        data.remarks = remarksDB.current;
        data.ldrNotes = ldrNotesDB.current;
        selectedData.current = data;
        if (!next) {
          setProgressLevel(levels.TIME);
          setProgressBar(progressBarLevel.TIME);
        }
      }
    }
  };

  const onStartTimeChange = async (event: { target: { value: string; }; }) => {
    try {
      if (event.target.value !== undefined) {
        const { value } = event.target;
        startTimeDB.current = value;
        setStartTime(value);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onEndTimeChange = async (event: { target: { value: string; }; }) => {
    try {
      if (event.target.value !== undefined) {
        const { value } = event.target;
        endTimeDB.current = value;
        setEndTime(value);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOptionalHover = () => {
    toast.closeAll();

    toast({
      description: optionalText,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleExpectedHover = () => {
    toast.closeAll();

    toast({
      description: expectedText,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const generateTimeSlots = useCallback(async () => {
    const start: JSX.Element[] = [];
    const end: JSX.Element[] = [];

    start.push(<option key='start' value='' aria-label='Default' />);
    end.push(<option key='end' value='' aria-label='Default' />);

    for (let key = 0; key <= Object.keys(timeSlots).length; key += 1) {
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

    setStartTimeDropdown(start);
    setEndTimeDropdown(end);
  }, []);

  const fetchNameOfUser = async (email: string): Promise<string> => {
    let res: string = '';

    if (memberData.current.length > 0) {
      for (let key = 0; key < memberData.current.length; key += 1) {
        const record: CCARecord = memberData.current[key];
        if (record.sessionEmail === email && record.sessionName !== undefined) {
          res = record.sessionName;
          break;
        }
      }
    }

    return res;
  };

  const fetchNameOfUserByID = async (id: string): Promise<string> => {
    let res: string = '';

    if (memberData.current.length > 0) {
      for (let key = 0; key < memberData.current.length; key += 1) {
        const record: CCARecord = memberData.current[key];
        if (record.sessionID === id && record.sessionName !== undefined) {
          res = record.sessionName;
          break;
        }
      }
    }

    return res;
  };

  const fetchUserIDByEmail = async (email: string): Promise<string> => {
    let res: string = '';

    if (memberData.current.length > 0) {
      for (let key = 0; key < memberData.current.length; key += 1) {
        const record: CCARecord = memberData.current[key];
        if (record.sessionEmail === email && record.sessionID !== undefined) {
          res = record.sessionID;
          break;
        }
      }
    }

    return res;
  };

  const buildMemberList = useCallback(
    async (content: { count: number; res: CCARecord[]; }) => {
      if (content.res.length > 0 && content.count > 0) {
        memberData.current = content.res;
      }
    },
    [],
  );

  const generateMemberList = useCallback(async () => {
    if (checkerString(ccaIDDB.current)) {
      setSubmitButtonPressed(true);
      try {
        const rawResponse = await fetch('/api/ccaRecord/fetch', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: ccaIDDB.current,
          }),
        });
        const content: Result = await rawResponse.json();
        if (content.status) {
          await buildMemberList(content.msg);
        }
      } catch (error) {
        console.error(error);
      }
      setSubmitButtonPressed(false);
    }
  }, [buildMemberList]);

  const changeCalendarDates = useCallback(async () => {
    if (checkerNumber(Number(threshold))) {
      const currentDate: Date = fetchCurrentDate();

      const newStart: Date = addDays(currentDate, locale, -Number(threshold));
      const newEnd: Date = addDays(currentDate, locale, Number(threshold));

      setCalendarStartDate(dateISO(newStart));
      setCalendarEndDate(dateISO(newEnd));
    }
  }, [threshold]);

  useEffect(() => {
    async function setupData(modalDataField: CCASession) {
      setLoadingData(true);

      const ccaidField: string = checkerString(modalDataField.ccaID)
        ? modalDataField.ccaID
        : '';
      ccaIDDB.current = ccaidField;

      const dateStrField: string =
        modalDataField.dateStr !== undefined &&
        checkerString(modalDataField.dateStr)
          ? modalDataField.dateStr
          : '';

      setDateStr(dateStrField);
      dateStrDB.current = dateStrField;

      selectedData.current = JSON.parse(JSON.stringify(modalDataField));

      await generateTimeSlots();
      await generateMemberList();

      await changeCalendarDates();

      setLoadingData(false);
    }

    if (modalData !== null && modalData !== undefined) {
      setupData(modalData);
    }
  }, [modalData, generateTimeSlots, generateMemberList, changeCalendarDates]);

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
          <SessionCreateConfirmationModal
            isOpen={confirmationData}
            onClose={() => setConfirmationData(null)}
            modalData={confirmationData}
            dataHandler={handleModalCloseButton}
          />

          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />

          <Progress hasStripe value={progressBar} />

          <MotionSimpleGrid
            mt='3'
            minChildWidth={{ base: 'full', md: '500px', lg: '800px' }}
            spacing='2em'
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox variants={cardVariant} key='motion-box-time2'>
              {modalData !== undefined &&
                modalData !== null &&
                !loadingData &&
                progressLevel === levels.TIME && (
                  <Flex
                    w='full'
                    h='full'
                    alignItems='center'
                    justifyContent='center'
                    mt={30}
                  >
                    <Stack spacing={10}>
                      <Stack
                        w={{ base: 'full', md: '500px', lg: '500px' }}
                        direction='row'
                      >
                        <FormControl id='name'>
                          <FormLabel>
                            <Text
                              w={40}
                              textTransform='uppercase'
                              lineHeight='5'
                              fontWeight='bold'
                              letterSpacing='tight'
                              mr={5}
                            >
                              Name
                            </Text>
                          </FormLabel>
                          <Input
                            type='text'
                            placeholder='Name'
                            value={name}
                            size='lg'
                            onChange={(event) => {
                              setName(event.currentTarget.value);
                              nameDB.current = event.currentTarget.value;
                            }}
                          />
                        </FormControl>

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
                            min={startDateCalendar}
                            max={endDateCalendar}
                            onChange={(event) => {
                              setDateStr(event.currentTarget.value);
                              dateStrDB.current = event.currentTarget.value;
                            }}
                          />
                        </FormControl>
                      </Stack>

                      {startTimeDropdown.length > 0 && (
                        <Stack w={{ base: 'full', md: '500px', lg: '500px' }}>
                          <FormLabel id='start-time'>
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

                      {endTimeDropdown.length > 0 && (
                        <Stack w={{ base: 'full', md: '500px', lg: '500px' }}>
                          <FormLabel id='end-time'>
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
                            if (event.cancelable) {
                              event.preventDefault();
                            }
                            setOptional(event.target.checked);
                            optionalDB.current = event.target.checked;
                            optionalStrDB.current = event.target.checked
                              ? 'Yes'
                              : 'No';
                          }}
                        >
                          Optional Session
                        </Checkbox>
                        <InfoIcon onMouseEnter={handleOptionalHover} />
                      </Stack>
                    </Stack>
                  </Flex>
                )}

              {modalData !== undefined &&
                modalData !== null &&
                !loadingData &&
                progressLevel === levels.REMARKS && (
                  <Flex
                    w='full'
                    h='full'
                    alignItems='center'
                    justifyContent='center'
                    mt={30}
                  >
                    <Stack spacing={10}>
                      <Stack
                        w={{ base: 'full', md: '500px', lg: '500px' }}
                        direction='column'
                      >
                        <FormControl id='remarks'>
                          <FormLabel>
                            <Stack direction='row'>
                              <Text
                                w={40}
                                textTransform='uppercase'
                                lineHeight='5'
                                fontWeight='bold'
                                letterSpacing='tight'
                                mr={5}
                              >
                                General Remarks
                              </Text>
                            </Stack>
                          </FormLabel>
                          <Textarea
                            height={150}
                            placeholder='Remarks (200 characters)'
                            size='lg'
                            value={remarks}
                            onChange={(event) => {
                              setRemarks(event.currentTarget.value);
                              remarksDB.current = event.currentTarget.value;
                            }}
                          />
                        </FormControl>

                        <FormControl id='leader-notes'>
                          <FormLabel>
                            <Stack direction='row'>
                              <Text
                                w={40}
                                textTransform='uppercase'
                                lineHeight='5'
                                fontWeight='bold'
                                letterSpacing='tight'
                                mr={5}
                              >
                                Leaders&apos; Notes
                              </Text>
                            </Stack>
                          </FormLabel>
                          <Textarea
                            height={150}
                            placeholder='Notes (200 characters)'
                            size='lg'
                            value={ldrNotes}
                            onChange={(event) => {
                              setLdrNotes(event.currentTarget.value);
                              ldrNotesDB.current = event.currentTarget.value;
                            }}
                          />
                        </FormControl>
                      </Stack>
                    </Stack>
                  </Flex>
                )}

              {checkerString(errorMsg) && (
                <Stack align='center'>
                  <Text>{errorMsg}</Text>
                </Stack>
              )}
            </MotionBox>
          </MotionSimpleGrid>
        </ModalBody>
        <ModalFooter>
          {progressLevel !== levels.TIME && (
            <Button
              key='previous-button'
              disabled={disableButton}
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

          {progressLevel !== levels.REMARKS && (
            <Button
              key='next-button'
              disabled={disableButton}
              bg='gray.400'
              color='white'
              w='150px'
              size='lg'
              _hover={{ bg: 'gray.600' }}
              onClick={async () => {
                await handleClick(true);
              }}
            >
              Next
            </Button>
          )}

          {progressLevel === levels.REMARKS && (
            <Button
              key='submit-button'
              disabled={disableButton}
              bg='red.400'
              color='white'
              w='150px'
              size='lg'
              _hover={{ bg: 'red.600' }}
              onClick={async () => {
                await handleSubmit();
              }}
            >
              Submit
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
