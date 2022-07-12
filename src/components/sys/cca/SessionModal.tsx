import React, { useState, useEffect } from 'react';
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

import { CCASession } from 'types/cca/ccaSession';
import { checkerString } from '@root/src/constants/sys/helper';
import SessionEditModal from './SessionEditModal';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function SessionModal({ isOpen, onClose, leader, modalData }) {
  const [loadingData, setLoadingData] = useState(true);
  const [specificSession, setSpecificSessionData] = useState<CCASession | null>(
    null,
  );

  const [ccaName, setCCAName] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [time, setTime] = useState('');
  const [optionalStr, setOptionalStr] = useState('');
  const [remarks, setRemarks] = useState('');
  const [ldrNotes, setLdrNotes] = useState('');
  const [editable, setEditable] = useState(false);

  const reset = () => {
    setDateStr('');
    setTime('');
    setOptionalStr('');
    setRemarks('');
    setLdrNotes('');
    setEditable(false);
  };

  const handleDelete = () => {};

  const handleEdit = () => {
    setSpecificSessionData(modalData);
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
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

      setDateStr(dateStrField);
      setTime(timeStrField);
      setOptionalStr(optionalStrField);
      setRemarks(remarksField);
      setLdrNotes(ldrNotesField);
      setCCAName(ccaNameField);
      setEditable(editableField);

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
