import React, { useCallback, useState, useEffect } from 'react';
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
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { cardVariant, parentVariant } from '@root/motion';

import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';

import { checkerString } from '@constants/sys/helper';

import SessionEditModal from '@components/sys/cca/SessionEditModal';
import SessionDeleteConfirmationModal from '@components/sys/cca/SessionDeleteConfirmationModal';
import { CCAAttendance } from '@root/src/types/cca/ccaAttendance';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function SessionModal({
  isOpen,
  onClose,
  leader,
  modalData,
  dataHandler,
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

  const [expectedM, setDisplayedExpected] = useState<JSX.Element[]>([]);
  const [expectedBool, setExpectedBool] = useState(false);

  const [realityM, setDisplayedReality] = useState<JSX.Element | null>();
  const [realityBool, setRealityBool] = useState(false);

  const reset = () => {
    setDateStr('');
    setTime('');
    setOptionalStr('');
    setRemarks('');
    setLdrNotes('');
    setEditable(false);
    setDuration(0);
  };

  const handleModalCloseButton = useCallback(() => {
    if (leader) {
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
          try {
            const rawResponse = await fetch('/api/ccaSession/delete', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: id,
              }),
            });
            const content: Result = await rawResponse.json();
            if (content.status) {
              handleModalCloseButton();
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    },
    [handleModalCloseButton],
  );

  const displayExpectedMembers = async (members: string) => {
    if (members.length > 0) {
      const membersA: string[] = members.split(',');
      const text: JSX.Element[] = [];
      for (let key = 0; key < membersA.length; key += 1) {
        if (membersA[key]) {
          text.push(
            <Box key={`box-e-${key}`}>
              <Text>{membersA[key]}</Text>
            </Box>,
          );
        }
      }

      setDisplayedExpected(text);
      setExpectedBool(true);
    } else {
      setDisplayedExpected([]);
    }
  };

  const displayRealityMembers = async (members: string) => {
    if (members.length > 0) {
      const membersA: CCAAttendance[] = JSON.parse(members) as CCAAttendance[];
      if (membersA.length > 0) {
        const text: JSX.Element[] = [];
        for (let key = 0; key < membersA.length; key += 1) {
          if (membersA[key]) {
            if (
              membersA[key].sessionName !== undefined &&
              membersA[key].ccaAttendance !== undefined
            ) {
              text.push(
                <Tr key={`tr-r-${key}`}>
                  <Td key={`td-r-${key}-1`}>
                    <Text>{membersA[key].sessionName}</Text>
                  </Td>
                  <Td key={`td-r-${key}-2`}>
                    <Text>{membersA[key].ccaAttendance}</Text>
                  </Td>
                </Tr>,
              );
            }
          }
        }

        const tableField: JSX.Element = (
          <TableContainer>
            <Table variant='simple'>
              <Tbody>{text}</Tbody>
            </Table>
          </TableContainer>
        );

        setDisplayedReality(tableField);
        setRealityBool(true);
      }
    } else {
      setDisplayedReality(null);
    }
  };

  useEffect(() => {
    async function setupData(modalDataField: CCASession) {
      setLoadingData(true);

      const dateStrField: string =
        modalDataField && modalDataField.dateStr ? modalDataField.dateStr : '';
      const timeStrField: string =
        modalDataField && modalDataField.time ? modalDataField.time : '';
      const optionalStrField: string =
        modalDataField && modalDataField.optionalStr
          ? modalDataField.optionalStr
          : '';
      const remarksField: string =
        modalDataField && modalDataField.remarks ? modalDataField.remarks : '';
      const ldrNotesField: string =
        modalDataField && modalDataField.ldrNotes
          ? modalDataField.ldrNotes
          : '';
      const ccaNameField: string =
        modalDataField && modalDataField.ccaName ? modalDataField.ccaName : '';
      const editableField: boolean =
        modalDataField && modalDataField.editable
          ? modalDataField.editable
          : false;
      const durationField: number =
        modalDataField && modalDataField.duration ? modalDataField.duration : 0;

      setDateStr(dateStrField);
      setTime(timeStrField);
      setOptionalStr(optionalStrField);
      setRemarks(remarksField);
      setLdrNotes(ldrNotesField);
      setCCAName(ccaNameField);
      setEditable(editableField);
      setDuration(durationField);

      if (
        modalDataField &&
        modalDataField.expectedMName !== undefined &&
        modalDataField.expectedMName?.length > 0
      ) {
        await displayExpectedMembers(modalDataField.expectedMName);
      }

      if (
        modalDataField &&
        modalDataField.realityM !== undefined &&
        modalDataField.realityM?.length > 0
      ) {
        await displayRealityMembers(modalDataField.realityM);
      }

      setLoadingData(false);
    }

    if (modalData) {
      setupData(modalData);
    }
  }, [modalData]);

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
          <SessionEditModal
            isOpen={specificSession}
            onClose={() => setSpecificSessionData(null)}
            modalData={specificSession}
            dataHandler={handleModalSuccessEdit}
          />

          <SessionDeleteConfirmationModal
            isOpen={specificSessionDelete}
            onClose={() => setSpecificSessionDeleteData(null)}
            modalData={specificSessionDelete}
            dataHandler={deleteSession}
          />

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
            minChildWidth={{ base: 'full', md: 'full' }}
            spacing='2em'
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox variants={cardVariant} key='2'>
              {modalData && !loadingData && (
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
                            <ListItem>
                              <Stack direction='row'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Date
                                </Text>{' '}
                                <Text>{dateStr}</Text>
                              </Stack>
                            </ListItem>
                          )}

                          {checkerString(time) && (
                            <ListItem>
                              <Stack direction='row'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Time
                                </Text>{' '}
                                <Text>{time}</Text>
                              </Stack>
                            </ListItem>
                          )}

                          {duration !== 0 && (
                            <ListItem>
                              <Stack direction='row'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Duration
                                </Text>{' '}
                                <Text>{duration} Hours</Text>
                              </Stack>
                            </ListItem>
                          )}

                          {checkerString(optionalStr) && (
                            <ListItem>
                              <Stack direction='row'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Optional
                                </Text>{' '}
                                <Text>{optionalStr}</Text>
                              </Stack>
                            </ListItem>
                          )}

                          {checkerString(remarks) && (
                            <ListItem>
                              <Stack direction='column'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Remarks
                                </Text>{' '}
                                <Text>{remarks}</Text>
                              </Stack>
                            </ListItem>
                          )}

                          {expectedBool && (
                            <ListItem key='exp-list'>
                              <Stack direction='column'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Expected Members
                                </Text>{' '}
                                {expectedM}
                              </Stack>
                            </ListItem>
                          )}

                          {realityBool && (
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
                                  <Text
                                    textTransform='uppercase'
                                    letterSpacing='tight'
                                    fontWeight='bold'
                                  >
                                    Hours
                                  </Text>
                                </Stack>
                                {realityM}
                              </Stack>
                            </ListItem>
                          )}

                          {leader && checkerString(ldrNotes) && (
                            <ListItem>
                              <Stack direction='column'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Leaders&apos; Notes
                                </Text>{' '}
                                <Text>{ldrNotes}</Text>
                              </Stack>
                            </ListItem>
                          )}
                        </List>
                      </Box>

                      {leader && (
                        <Stack direction='row'>
                          <Button
                            bg='gray.400'
                            color='white'
                            w='150px'
                            size='lg'
                            onClick={handleDelete}
                            _hover={{ bg: 'cyan.800' }}
                          >
                            Delete
                          </Button>
                          {editable && (
                            <Button
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
                      )}
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