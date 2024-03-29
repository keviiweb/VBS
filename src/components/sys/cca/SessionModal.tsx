import React, { useCallback, useState, useEffect, useMemo } from 'react';
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

import { type Result } from 'types/api';
import { type CCASession } from 'types/cca/ccaSession';
import { type CCAAttendance } from 'types/cca/ccaAttendance';

import { checkerString } from '@constants/sys/helper';
import { removeDuplicate } from '@constants/sys/ccaAttendance';
import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';

import LoadingModal from '@components/sys/misc/LoadingModal';
import TableWidget from '@components/sys/misc/TableWidget';
import SessionEditModal from '@components/sys/cca/SessionEditModal';
import SessionDeleteConfirmationModal from '@components/sys/cca/SessionDeleteConfirmationModal';
import { type Session } from 'next-auth/core/types';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Renders a modal that displays information about the specified session
 *
 * @param param0 Modal functions and callback function
 * @returns A modal
 */
export default function SessionModal({
  isOpen,
  onClose,
  leader,
  modalData,
  dataHandler,
  userSession,
}) {
  const [loadingData, setLoadingData] = useState(true);
  const [specificSession, setSpecificSessionData] = useState<CCASession | null>(
    null,
  );

  const [specificSessionDelete, setSpecificSessionDeleteData] =
    useState<CCASession | null>(null);

  const [ccaName, setCCAName] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [time, setTime] = useState('');
  const [optionalStr, setOptionalStr] = useState('');
  const [remarks, setRemarks] = useState('');
  const [ldrNotes, setLdrNotes] = useState('');
  const [editable, setEditable] = useState(false);
  const [duration, setDuration] = useState(0);

  const [dataM, setDataM] = useState<CCAAttendance[]>([]);
  const [realityBool, setRealityBool] = useState(false);

  const PAGESIZE: number = 10;
  const [pageCount, setPageCount] = useState(0);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const [session, setSession] = useState<Session | null>(null);

  const reset = () => {
    setLoadingData(true);

    setSpecificSessionData(null);
    setSpecificSessionDeleteData(null);

    setCCAName('');
    setDateStr('');
    setTime('');
    setOptionalStr('');
    setRemarks('');
    setLdrNotes('');
    setEditable(false);
    setDuration(0);

    setDataM([]);
    setRealityBool(false);

    setPageCount(0);

    setSubmitButtonPressed(false);

    setSession(null);
  };

  const handleModalCloseButton = useCallback(() => {
    if (leader as boolean) {
      dataHandler();
    }

    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  }, [leader, dataHandler, onClose]);

  const handleDelete = () => {
    setSpecificSessionDeleteData(modalData);
  };

  const handleEdit = () => {
    setSpecificSessionData(modalData);
  };

  const handleModalSuccessEdit = () => {
    handleModalCloseButton();
  };

  const deleteSession = useCallback(
    async (sess: CCASession) => {
      if (sess !== null && sess !== undefined) {
        const { id } = sess;
        if (id !== undefined && checkerString(id)) {
          setSubmitButtonPressed(true);
          try {
            const rawResponse = await fetch('/api/ccaSession/delete', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id,
              }),
            });
            const content: Result = await rawResponse.json();
            if (content.status) {
              handleModalCloseButton();
            }
          } catch (error) {
            console.error(error);
          }
          setSubmitButtonPressed(false);
        }
      }
    },
    [handleModalCloseButton],
  );

  const displayRealityMembers = async (members: string) => {
    if (members.length > 0) {
      const membersA: CCAAttendance[] = JSON.parse(members) as CCAAttendance[];
      if (membersA.length > 0) {
        setDataM(removeDuplicate(membersA));
        setRealityBool(true);

        if (membersA.length % PAGESIZE === 0) {
          setPageCount(Math.floor(membersA.length / PAGESIZE));
        } else {
          setPageCount(Math.floor(membersA.length / PAGESIZE) + 1);
        }
      }
    } else {
      setDataM([]);
      setRealityBool(false);
    }
  };

  useEffect(() => {
    async function setupData(
      modalDataField: CCASession,
      userSessionField: Session | null,
    ) {
      setLoadingData(true);
      setSession(userSessionField);

      const dateStrField: string =
        modalDataField.dateStr !== undefined ? modalDataField.dateStr : '';
      const timeStrField: string = checkerString(modalDataField.time)
        ? modalDataField.time
        : '';
      const optionalStrField: string =
        modalDataField.optionalStr !== undefined
          ? modalDataField.optionalStr
          : '';
      const remarksField: string =
        modalDataField.remarks !== undefined ? modalDataField.remarks : '';
      const ldrNotesField: string =
        modalDataField.ldrNotes !== undefined ? modalDataField.ldrNotes : '';
      const ccaNameField: string =
        modalDataField.ccaName !== undefined ? modalDataField.ccaName : '';
      const editableField: boolean =
        modalDataField.editable !== undefined ? modalDataField.editable : false;
      const durationField: number =
        modalDataField.duration !== undefined ? modalDataField.duration : 0;

      setDateStr(dateStrField);
      setTime(timeStrField);
      setOptionalStr(optionalStrField);
      setRemarks(remarksField);
      setLdrNotes(ldrNotesField);
      setCCAName(ccaNameField);
      setEditable(editableField);
      setDuration(durationField);

      if (
        modalDataField.realityM !== undefined &&
        modalDataField.realityM.length > 0
      ) {
        await displayRealityMembers(modalDataField.realityM);
      }

      setLoadingData(false);
    }

    if (modalData !== null && modalData !== undefined) {
      setupData(modalData, userSession);
    }
  }, [modalData, userSession]);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'sessionName',
      },
      {
        Header: 'Hours',
        accessor: 'ccaAttendance',
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
          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => {
              setSubmitButtonPressed(false);
            }}
          />

          <SessionEditModal
            isOpen={specificSession}
            onClose={() => {
              setSpecificSessionData(null);
            }}
            modalData={specificSession}
            dataHandler={handleModalSuccessEdit}
            userSession={session}
          />

          <SessionDeleteConfirmationModal
            isOpen={specificSessionDelete}
            onClose={() => {
              setSpecificSessionDeleteData(null);
            }}
            modalData={specificSessionDelete}
            dataHandler={deleteSession}
          />

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
              {modalData !== null &&
                modalData !== undefined &&
                !loadingData && (
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
                          <List spacing={5}>
                            {checkerString(dateStr) && (
                              <ListItem key='session-date'>
                                <Stack direction='row'>
                                  <Text
                                    textTransform='uppercase'
                                    letterSpacing='tight'
                                    fontWeight='bold'
                                  >
                                    Date
                                  </Text>
                                  <Text>{dateStr}</Text>
                                </Stack>
                              </ListItem>
                            )}

                            {checkerString(time) && (
                              <ListItem key='session-time'>
                                <Stack direction='row'>
                                  <Text
                                    textTransform='uppercase'
                                    letterSpacing='tight'
                                    fontWeight='bold'
                                  >
                                    Time
                                  </Text>
                                  <Text>{time}</Text>
                                </Stack>
                              </ListItem>
                            )}

                            {duration !== 0 && (
                              <ListItem key='session-duration'>
                                <Stack direction='row'>
                                  <Text
                                    textTransform='uppercase'
                                    letterSpacing='tight'
                                    fontWeight='bold'
                                  >
                                    Duration
                                  </Text>
                                  <Text>{duration} Hours</Text>
                                </Stack>
                              </ListItem>
                            )}

                            {checkerString(optionalStr) && (
                              <ListItem key='session-opt'>
                                <Stack direction='row'>
                                  <Text
                                    textTransform='uppercase'
                                    letterSpacing='tight'
                                    fontWeight='bold'
                                  >
                                    Optional
                                  </Text>
                                  <Text>{optionalStr}</Text>
                                </Stack>
                              </ListItem>
                            )}

                            {checkerString(remarks) && (
                              <ListItem key='session-remark'>
                                <Stack direction='column'>
                                  <Text
                                    textTransform='uppercase'
                                    letterSpacing='tight'
                                    fontWeight='bold'
                                  >
                                    Remarks
                                  </Text>
                                  <Text>{remarks}</Text>
                                </Stack>
                              </ListItem>
                            )}

                            {(leader as boolean) && realityBool && (
                              <ListItem key='real-list'>
                                <Stack direction='column'>
                                  <Stack spacing={20} direction='row'>
                                    <Text
                                      textTransform='uppercase'
                                      letterSpacing='tight'
                                      fontWeight='bold'
                                    >
                                      Members Present
                                    </Text>
                                  </Stack>
                                  <TableWidget
                                    id='realityM-table'
                                    columns={columns}
                                    data={dataM}
                                    controlledPageCount={pageCount}
                                    dataHandler={null}
                                    showPage={false}
                                  />
                                </Stack>
                              </ListItem>
                            )}

                            {(leader as boolean) && checkerString(ldrNotes) && (
                              <ListItem key='ldr-note'>
                                <Stack direction='column'>
                                  <Text
                                    textTransform='uppercase'
                                    letterSpacing='tight'
                                    fontWeight='bold'
                                  >
                                    Leaders&apos; Notes
                                  </Text>
                                  <Text>{ldrNotes}</Text>
                                </Stack>
                              </ListItem>
                            )}
                          </List>
                        </Box>

                        <Stack direction='row'>
                          {((session !== null &&
                            hasPermission(
                              session.user.admin,
                              actions.OVERRIDE_DELETE_SESSION,
                            )) ||
                            (editable && (leader as boolean))) && (
                            <Button
                              key='delete-button'
                              bg='gray.400'
                              color='white'
                              w='150px'
                              size='lg'
                              onClick={handleDelete}
                              _hover={{ bg: 'cyan.800' }}
                            >
                              Delete
                            </Button>
                          )}

                          {((session !== null &&
                            hasPermission(
                              session.user.admin,
                              actions.OVERRIDE_EDIT_SESSION,
                            )) ||
                            (editable && (leader as boolean))) && (
                            <Button
                              key='edit-button'
                              bg='red.700'
                              color='white'
                              w='150px'
                              size='lg'
                              onClick={handleEdit}
                              _hover={{ bg: 'cyan.800' }}
                            >
                              Edit
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Flex>
                )}
            </MotionBox>
          </MotionSimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button
            bg='cyan.700'
            key='submit-button'
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
