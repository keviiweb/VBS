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
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { cardVariant, parentVariant } from '@root/motion';
import { CCASession } from 'types/cca/ccaSession';
import { Result } from 'types/api';

import { checkerString } from '@constants/sys/helper';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function SessionEditConfirmationModal({
  isOpen,
  onClose,
  modalData,
  dataHandler,
}) {
  const toast = useToast();

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

  const [expectedM, setDisplayedExpected] = useState<JSX.Element[]>([]);
  const [expectedBool, setExpectedBool] = useState(false);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);
  const [isSubmitting, setIsSubmit] = useState(false);

  const reset = () => {
    setDateStr('');
    setCCAName('');
    setError('');
    setName('');
    setOptionalStr('');
    setTime('');
    setDuration('');
    setRemarks('');
    setLdrNotes('');
    setIsSubmit(false);

    setDisplayedExpected([]);

    setExpectedBool(false);
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const handleModalCloseSuccess = useCallback(() => {
    setTimeout(() => {
      dataHandler();
      reset();
      onClose();
    }, 200);
  }, [dataHandler, onClose]);

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

  const handleSubmit = useCallback(async () => {
    setSubmitButtonPressed(true);
    setIsSubmit(true);

    try {
      const rawResponse = await fetch('/api/ccaSession/create', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: selectedData.current,
        }),
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        toast({
          title: 'Success',
          description: content.msg,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        handleModalCloseSuccess();
      } else {
        toast({
          title: 'Error',
          description: content.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });

        setIsSubmit(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmit(false);
    }

    setSubmitButtonPressed(false);
  }, [handleModalCloseSuccess, toast]);

  useEffect(() => {
    async function setupData(modalDataField: CCASession) {
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

      if (
        modalDataField &&
        modalDataField.expectedMName !== undefined &&
        modalDataField.expectedMName?.length > 0
      ) {
        await displayExpectedMembers(modalDataField.expectedMName);
      }

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
                        <ListItem key='name-list'>
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
                        <ListItem key='date-list'>
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
                        <ListItem key='time-list'>
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
                        <ListItem key='durat-list'>
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
                        <ListItem key='opt-list'>
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
                        <ListItem key='rem-list'>
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
                        <ListItem key='ldr-list'>
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
