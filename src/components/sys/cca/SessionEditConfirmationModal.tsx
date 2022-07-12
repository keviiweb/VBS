import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Text,
  // useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { cardVariant, parentVariant } from '@root/motion';
import { CCASession } from 'types/cca/ccaSession';

import { checkerString } from '@constants/sys/helper';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function SessionEditConfirmationModal({
  isOpen,
  onClose,
  modalData,
}) {
  // const toast = useToast();

  const selectedData = useRef<CCASession | null>(null);

  const [loadingData, setLoadingData] = useState(true);

  const [errorMsg, setError] = useState('');

  const [name, setName] = useState('');
  const [ccaName, setCCAName] = useState('');
  const [dateStr, setDateStr] = useState('');

  const [optionalStr, setOptionalStr] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');

  const [remarks, setRemarks] = useState('');
  const [ldrNotes, setLdrNotes] = useState('');

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const reset = () => {
    setDateStr('');
    setCCAName('');
    setError('');
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  /*
  const displayExpectedMembers = (members: string[]) => {
    if (members.length > 0) {
      let text: string = 'Selected members(s): ';
      let counter: number = 0;

      for (let key = 0; key < members.length; key += 1) {
        if (members[key]) {
          counter += 1;
          if (counter !== members.length) {
            text += ` ${members[key]} ,`;
          } else {
            text += ` ${members[key]} `;
          }
        }
      }

      setDisplayedExpected(text);
    } else {
      setDisplayedExpected('');
    }
  }; */

  /*
  const displayRealityMembers = (members: CCAAttendance[]) => {
    if (members.length > 0) {
      let text: string = 'Selected members(s): ';
      let counter: number = 0;

      for (let key = 0; key < members.length; key += 1) {
        if (members[key]) {
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
      }

      setDisplayedReality(text);
    } else {
      setDisplayedReality('');
    }
  }; */
  // const handleClick = useCallback(async () => {}, []);

  const handleSubmit = useCallback(async () => {}, []);

  useEffect(() => {
    async function setupData(modalDataField: CCASession) {
      console.log(modalDataField);

      setLoadingData(true);
      setSubmitButtonPressed(true);

      const dateStrField: string =
        modalDataField && modalDataField.dateStr ? modalDataField.dateStr : '';
      const ccaNameField: string =
        modalDataField && modalDataField.ccaName ? modalDataField.ccaName : '';
      const nameField: string =
        modalDataField && modalDataField.name ? modalDataField.name : '';

      setDateStr(dateStrField);
      setCCAName(ccaNameField);
      setName(nameField);

      const timeField: string =
        modalDataField && modalDataField.time ? modalDataField.time : '';

      setTime(timeField);

      const durationField: string =
        modalDataField && modalDataField.duration
          ? modalDataField.duration.toString()
          : '';

      setDuration(durationField);

      const optionalStrField: string =
        modalDataField && modalDataField.optionalStr
          ? modalDataField.optionalStr
          : '';
      setOptionalStr(optionalStrField);

      const remark: string =
        modalDataField && modalDataField.remarks ? modalDataField.remarks : '';
      setRemarks(remark);

      const ldrNote: string =
        modalDataField && modalDataField.ldrNotes
          ? modalDataField.ldrNotes
          : '';
      setLdrNotes(ldrNote);

      selectedData.current = JSON.parse(JSON.stringify(modalDataField));

      setLoadingData(false);
      setSubmitButtonPressed(false);
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
          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
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
            minChildWidth={{ base: 'full', md: '500px', lg: '800px' }}
            spacing='2em'
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox variants={cardVariant} key='motion-box-time2'>
              {modalData && !loadingData && (
                <Flex
                  w='full'
                  h='full'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Stack
                    w={{ base: 'full', md: '500px', lg: '500px' }}
                    direction='row'
                  >
                    <List spacing={5}>
                      {checkerString(name) && (
                        <ListItem>
                          <Stack direction='row'>
                            <Text
                              textTransform='uppercase'
                              letterSpacing='tight'
                              fontWeight='bold'
                            >
                              Name
                            </Text>{' '}
                            <Text>{name}</Text>
                          </Stack>
                        </ListItem>
                      )}
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
                      {checkerString(duration) && (
                        <ListItem>
                          <Stack direction='row'>
                            <Text
                              textTransform='uppercase'
                              letterSpacing='tight'
                              fontWeight='bold'
                            >
                              Duration
                            </Text>{' '}
                            <Text>{duration}</Text>
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
                      {checkerString(ldrNotes) && (
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
          <Button
            bg='blue.400'
            color='white'
            w='150px'
            size='lg'
            _hover={{ bg: 'blue.600' }}
            mr={5}
            onClick={handleModalCloseButton}
          >
            Back
          </Button>

          <Button
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
