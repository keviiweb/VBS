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
import SessionEditConfirmationModal from '@components/sys/cca/SessionEditConfirmationModal';
import MemberButton from '@components/sys/cca/MemberButton';

import { cardVariant, parentVariant } from '@root/motion';
import { InfoIcon } from '@chakra-ui/icons';
import { type CCASession } from 'types/cca/ccaSession';
import { type Result } from 'types/api';
import { type CCARecord } from 'types/cca/ccaRecord';
import { type CCAAttendance } from 'types/cca/ccaAttendance';
import { type Session } from 'next-auth/core/types';

import { checkerString } from '@constants/sys/helper';
import { timeSlots } from '@constants/sys/timeslot';
import {
  convertDateToUnix,
  isValidDate,
  calculateDuration,
  dateISO,
  fetchCurrentDate,
  locale,
} from '@constants/sys/date';
import { removeDuplicate } from '@constants/sys/ccaAttendance';
import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

import moment from 'moment';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const levels = {
  TIME: 0,
  REALITY: 1,
  REMARKS: 2,
};

const progressBarLevel = {
  TIME: 33,
  REALITY: 66,
  REMARKS: 100,
};

/**
 * Renders a modal for the Session Edit modal
 *
 * This modal consist of the entire workflow process of editing a session
 *
 * 1. The name, start time, end time is displayed and edited
 * 2. Attendance hours are clocked in
 * 3. Redirect to confirmation modal
 *
 * @param param0 Modal functions
 * @returns A modal
 */
export default function SessionEditModal({
  isOpen,
  onClose,
  modalData,
  dataHandler,
  userSession,
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

  const sessionIDDB = useRef('');
  const ccaIDDB = useRef('');

  const [ccaName, setCCAName] = useState('');
  const [dateStr, setDateStr] = useState('');
  const dateStrDB = useRef('');
  const [name, setName] = useState('');
  const nameDB = useRef('');

  const [upcoming, setUpcoming] = useState(false);

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

  const [editable, setEditable] = useState(false);

  const optionalText: string = `Hours from optional sessions will act as bonus hours ie they will not affect the total number of hours.
      Example: Yunus has attended 10 out of 12 hours. 
      If he attends a 3 hour optional session, his attendance will be boosted to 12 out of 12 hours`;

  const realityText: string = `Members who turned up for the session can be selected, then assigned partial or
      full hours.`;

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const memberData = useRef<CCARecord[]>([]);

  const selectedRealityMembers = useRef<string[]>([]);
  const [displayedReality, setDisplayedReality] = useState('');
  const selectedRealityMembersName = useRef<string[]>([]);
  const [realityMemberButtons, setRealityMemberButtons] = useState<
    JSX.Element[]
  >([]);
  const realityMemberHours = useRef<CCAAttendance[]>([]);

  const [session, setSession] = useState<Session | null>(null);

  const reset = () => {
    selectedData.current = null;
    setConfirmationData(null);

    setProgressLevel(levels.TIME);
    setProgressBar(progressBarLevel.TIME);
    setLoadingData(true);

    setError('');

    sessionIDDB.current = '';
    ccaIDDB.current = '';

    setCCAName('');
    setDateStr('');
    setName('');
    setUpcoming(false);
    setOptional(false);
    setEndTimeDropdown([]);
    setStartTimeDropdown([]);
    setStartTime('');
    setEndTime('');

    dateStrDB.current = '';
    nameDB.current = '';
    optionalDB.current = false;
    optionalStrDB.current = 'No';

    startTimeDB.current = '';
    endTimeDB.current = '';

    setRemarks('');
    setLdrNotes('');
    remarksDB.current = '';
    ldrNotesDB.current = '';

    setEditable(false);
    setSubmitButtonPressed(false);
    setDisableButton(false);

    memberData.current = [];

    setRealityMemberButtons([]);
    setDisplayedReality('');
    selectedRealityMembers.current = [];

    selectedRealityMembersName.current = [];
    realityMemberHours.current = [];

    setSession(null);
  };

  const handleModalCloseButton = useCallback(async () => {
    setTimeout(async () => {
      setSubmitButtonPressed(true);
      await dataHandler();
      reset();
      onClose();
    }, 200);
  }, [dataHandler, onClose]);

  const checkRealityMembers = (membersF: string): boolean => {
    const members: CCAAttendance[] = JSON.parse(membersF) as CCAAttendance[];
    if (
      members.length > 0 &&
      selectedData.current != null &&
      selectedData.current.duration !== undefined
    ) {
      for (let key = 0; key < members.length; key += 1) {
        const attendance: CCAAttendance = members[key];
        if (attendance.ccaAttendance > selectedData.current.duration) {
          return false;
        }
      }
    }

    return true;
  };

  const validateFieldsEdit = (
    idField: string,
    nameField: string,
    dateField: string,
    startTimeField: string,
    endTimeField: string,
  ) => {
    if (!checkerString(idField)) {
      setError('Please select an event!');
      return false;
    }

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
      setError('End time cannot be earlier than or same as start time!');
      return false;
    }

    return true;
  };

  const validateFieldsSubmit = (selectedDataField: CCASession) => {
    if (
      selectedDataField.id === undefined ||
      !checkerString(selectedDataField.id)
    ) {
      setError('Please select a session!');
      return false;
    }

    if (!checkerString(selectedDataField.name)) {
      setError('Please set a name!');
      return false;
    }

    if (!checkerString(selectedDataField.time)) {
      setError('Please set a time!');
      return false;
    }

    if (
      selectedDataField.remarks === undefined ||
      !checkerString(selectedDataField.remarks)
    ) {
      setError('Please set a remark!');
      return false;
    }

    if (
      selectedDataField.ldrNotes === undefined ||
      !checkerString(selectedDataField.ldrNotes)
    ) {
      setError('Please set a note!');
      return false;
    }

    if (
      selectedDataField.realityM === undefined ||
      !checkRealityMembers(selectedDataField.realityM)
    ) {
      setError(
        'One or more members have an attendance exceeding the total duration',
      );
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

  const displayRealityMembers = (members: CCAAttendance[]) => {
    if (members.length > 0) {
      let text: string = 'Selected members(s): ';
      let counter: number = 0;

      for (let key = 0; key < members.length; key += 1) {
        counter += 1;
        if (
          members[key].sessionName !== undefined &&
          members[key].ccaAttendance !== undefined
        ) {
          if (counter !== members.length) {
            text += ` ${members[key].sessionName} (${members[key].ccaAttendance} hours) ,`;
          } else {
            text += ` ${members[key].sessionName} (${members[key].ccaAttendance} hours)  `;
          }
        }
      }

      setDisplayedReality(text);
    } else {
      setDisplayedReality('');
    }
  };

  const handleClick = async (next: boolean) => {
    if (progressLevel === levels.TIME) {
      if (selectedData.current !== null) {
        setError('');
        if (
          validateFieldsEdit(
            sessionIDDB.current,
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
            setProgressLevel(levels.REALITY);
            setProgressBar(progressBarLevel.REALITY);
          }
        }
      }
    } else if (progressLevel === levels.REALITY) {
      if (selectedData.current !== null) {
        setError('');
        const data: CCASession = selectedData.current;

        if (realityMemberHours.current.length > 0) {
          realityMemberHours.current = removeDuplicate(
            realityMemberHours.current,
          );
          displayRealityMembers(realityMemberHours.current);
        }

        data.realityM = JSON.stringify(realityMemberHours.current);
        selectedData.current = data;
        if (next) {
          setProgressLevel(levels.REMARKS);
          setProgressBar(progressBarLevel.REMARKS);
        } else {
          setProgressLevel(levels.TIME);
          setProgressBar(progressBarLevel.TIME);
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
          setProgressLevel(levels.REALITY);
          setProgressBar(progressBarLevel.REALITY);
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

  const handleRealityHover = () => {
    toast.closeAll();

    toast({
      description: realityText,
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

  const onHoursChange = useCallback(
    async (email: string, nameField: string, hour: number) => {
      setError('');
      setDisableButton(false);
      if (
        selectedData.current !== null &&
        selectedData.current.duration !== undefined &&
        !Number.isNaN(hour) &&
        hour >= 0 &&
        hour <= selectedData.current.duration
      ) {
        const realityHours: CCAAttendance[] = realityMemberHours.current;
        let notFound = false;

        for (let key = 0; key < realityHours.length; key += 1) {
          const reality: CCAAttendance = realityHours[key];
          if (reality.sessionEmail === email) {
            reality.ccaAttendance = hour;
            notFound = true;
            break;
          }
        }

        if (!notFound) {
          const attendance: CCAAttendance = {
            ccaID: ccaIDDB.current,
            ccaAttendance: hour,
            sessionEmail: email,
            sessionName: nameField,
          };

          realityHours.push(attendance);
        }

        realityMemberHours.current = removeDuplicate(
          realityMemberHours.current,
        );
      } else if (
        selectedData.current !== null &&
        selectedData.current.duration !== undefined
      ) {
        setError(
          `Duration of member must not be negative or exceed ${selectedData.current.duration}`,
        );
        setDisableButton(true);
      }

      displayRealityMembers(realityMemberHours.current);
    },
    [],
  );

  const buildMemberList = useCallback(
    async (content: { count: number; res: CCARecord[]; }) => {
      if (content.res.length > 0 && content.count > 0) {
        const realityButtons: JSX.Element[] = [];

        for (let key = 0; key < content.res.length; key += 1) {
          const record: CCARecord = content.res[key];
          if (
            record.sessionEmail !== undefined &&
            record.sessionName !== undefined
          ) {
            const { sessionEmail, sessionName } = record;

            realityButtons.push(
              <MemberButton
                reality
                key={sessionEmail}
                handleClick={onHoursChange}
                newKey={sessionEmail}
                id={sessionEmail}
                name={sessionName}
              />,
            );
          }
        }

        memberData.current = content.res;
        setRealityMemberButtons(realityButtons);
      }
    },
    [onHoursChange],
  );

  const generateMemberList = useCallback(async () => {
    if (checkerString(sessionIDDB.current) && checkerString(ccaIDDB.current)) {
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

  useEffect(() => {
    async function setupData(
      modalDataField: CCASession,
      userSessionField: Session | null,
    ) {
      setLoadingData(true);
      setSubmitButtonPressed(true);

      setSession(userSessionField);

      const editableField: boolean =
        modalDataField !== null &&
        modalDataField !== undefined &&
        modalDataField.editable !== undefined &&
        modalDataField.editable
          ? modalDataField.editable
          : false;
      setEditable(editableField);

      const idField: string =
        modalDataField.id !== undefined ? modalDataField.id : '';
      sessionIDDB.current = idField;

      const ccaidField: string = checkerString(modalDataField.ccaID)
        ? modalDataField.ccaID
        : '';
      ccaIDDB.current = ccaidField;

      const dateStrField: string =
        modalDataField.dateStr !== undefined ? modalDataField.dateStr : '';
      const ccaNameField: string =
        modalDataField.ccaName !== undefined ? modalDataField.ccaName : '';

      const nameField: string = checkerString(modalDataField.name)
        ? modalDataField.name
        : '';
      setName(nameField);
      nameDB.current = nameField;

      setDateStr(dateStrField);
      dateStrDB.current = dateStrField;

      setCCAName(ccaNameField);

      const split: string[] = checkerString(modalDataField.time)
        ? modalDataField.time.split('-')
        : [' - '];
      const start: string = split[0].trim();
      const end: string = split[1].trim();

      startTimeDB.current = start;
      endTimeDB.current = end;
      setStartTime(start);
      setEndTime(end);

      const day: Date = new Date(dateStrField);
      if (isValidDate(day)) {
        if (day > fetchCurrentDate()) {
          if (dateISO(day) === dateISO(fetchCurrentDate())) {
            const currentTime: string = moment
              .tz(moment(), locale)
              .format('HH:mm')
              .replace(':', '');

            if (Number(currentTime) >= Number(start)) {
              setUpcoming(true);
            } else {
              setUpcoming(false);
            }
          } else {
            setUpcoming(true);
          }
        } else {
          setUpcoming(false);
        }
      }

      const opt: boolean =
        modalDataField.optional !== undefined ? modalDataField.optional : false;
      setOptional(opt);
      optionalDB.current = opt;
      optionalStrDB.current = opt ? 'Yes' : 'No';

      const realityM: string =
        modalDataField.realityM !== undefined ? modalDataField.realityM : '';
      if (realityM.length > 0) {
        realityMemberHours.current = JSON.parse(realityM) as CCAAttendance[];
        displayRealityMembers(realityMemberHours.current);
      }

      const remark: string =
        modalDataField.remarks !== undefined ? modalDataField.remarks : '';
      setRemarks(remark);
      remarksDB.current = remark;

      const ldrNote: string =
        modalDataField.ldrNotes !== undefined ? modalDataField.ldrNotes : '';
      setLdrNotes(ldrNote);
      ldrNotesDB.current = ldrNote;

      selectedData.current = JSON.parse(JSON.stringify(modalDataField));

      await generateTimeSlots();
      await generateMemberList();
      setLoadingData(false);
      setSubmitButtonPressed(false);
    }

    if (modalData !== undefined && modalData !== null) {
      setupData(modalData, userSession);
    }
  }, [modalData, userSession, generateTimeSlots, generateMemberList]);

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
          <SessionEditConfirmationModal
            isOpen={confirmationData}
            onClose={() => {
              setConfirmationData(null);
            }}
            modalData={confirmationData}
            dataHandler={handleModalCloseButton}
          />

          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => {
              setSubmitButtonPressed(false);
            }}
          />

          {(editable ||
            (session !== null &&
              hasPermission(
                session.user.admin,
                actions.OVERRIDE_EDIT_SESSION,
              ))) && (
            <Box>
              {checkerString(ccaName) && (
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
              )}

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
                  {modalData !== null &&
                    modalData !== undefined &&
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
                                disabled
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
                          {startTimeDropdown.length > 0 && (
                            <Stack
                              w={{ base: 'full', md: '500px', lg: '500px' }}
                            >
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

                          {endTimeDropdown.length > 0 && (
                            <Stack
                              w={{ base: 'full', md: '500px', lg: '500px' }}
                            >
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

                  {modalData !== null &&
                    modalData !== undefined &&
                    !loadingData &&
                    progressLevel === levels.REALITY &&
                    !upcoming && (
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
                            {selectedData.current?.duration !== undefined && (
                              <List spacing={5}>
                                <ListItem>
                                  <Stack direction='row'>
                                    <Text
                                      textTransform='uppercase'
                                      letterSpacing='tight'
                                      fontWeight='bold'
                                    >
                                      Duration
                                    </Text>
                                    <Text>
                                      {selectedData.current?.duration} Hours
                                    </Text>
                                  </Stack>
                                </ListItem>
                              </List>
                            )}
                          </Stack>

                          {realityMemberButtons.length > 0 && (
                            <Stack
                              w={{ base: 'full', md: '500px', lg: '500px' }}
                            >
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
                                    Members Present
                                  </Text>
                                  <InfoIcon onMouseEnter={handleRealityHover} />
                                </Stack>
                              </FormLabel>

                              <Text>{displayedReality}</Text>
                              <Stack
                                direction={['column', 'row']}
                                align='center'
                              >
                                <ButtonGroup display='flex' flexWrap='wrap'>
                                  {realityMemberButtons}
                                </ButtonGroup>
                              </Stack>
                            </Stack>
                          )}
                        </Stack>
                      </Flex>
                    )}

                  {modalData !== null &&
                    modalData !== undefined &&
                    !loadingData &&
                    progressLevel === levels.REALITY &&
                    upcoming && (
                      <Flex
                        w='full'
                        h='full'
                        alignItems='center'
                        justifyContent='center'
                        mt={30}
                      >
                        <Stack spacing={10} align='center'>
                          <Text color='red.500'>
                            Unable to mark attendance. The session has not
                            commenced.
                          </Text>
                          <Text color='red.500'>Click next to proceed.</Text>
                        </Stack>
                      </Flex>
                    )}

                  {modalData !== null &&
                    modalData !== undefined &&
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
                                  ldrNotesDB.current =
                                    event.currentTarget.value;
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
            </Box>
          )}

          {!editable &&
            session !== null &&
            !hasPermission(
              session.user.admin,
              actions.OVERRIDE_EDIT_SESSION,
            ) && (
              <Box>
                <Text>Sorry, this session is not editable.</Text>
              </Box>
            )}
        </ModalBody>
        <ModalFooter>
          {(editable ||
            (session !== null &&
              hasPermission(
                session.user.admin,
                actions.OVERRIDE_EDIT_SESSION,
              ))) && (
            <Box>
              {progressLevel !== levels.TIME && (
                <Button
                  disabled={disableButton}
                  bg='blue.400'
                  key='prev-button'
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
                  disabled={disableButton}
                  key='next-button'
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
                  disabled={disableButton}
                  key='submit-button'
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
            </Box>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
