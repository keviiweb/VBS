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

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function SessionModal({ isOpen, onClose, leader, modalData }) {
  const [loadingData, setLoadingData] = useState(true);

  const [dateStr, setDateStr] = useState('');
  const [time, setTime] = useState('');
  const [optionalStr, setOptionalStr] = useState('');
  const [remarks, setRemarks] = useState('');
  const [ldrNotes, setLdrNotes] = useState('');

  const reset = () => {
    setDateStr('');
    setTime('');
    setOptionalStr('');
    setRemarks('');
    setLdrNotes('');
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

      const dateStrField =
        modalDataField && modalDataField.dateStr ? modalDataField.dateStr : '';
      const timeStrField =
        modalDataField && modalDataField.time ? modalDataField.time : '';
      const optionalStrField =
        modalDataField && modalDataField.optionalStr
          ? modalDataField.optionalStr
          : '';
      const remarksField =
        modalDataField && modalDataField.remarks ? modalDataField.remarks : '';
      const ldrNotesField =
        modalDataField && modalDataField.ldrNotes
          ? modalDataField.ldrNotes
          : '';

      setDateStr(dateStrField);
      setTime(timeStrField);
      setOptionalStr(optionalStrField);
      setRemarks(remarksField);
      setLdrNotes(ldrNotesField);

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

                          <ListItem>
                            <Stack direction='row'>
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

                          {leader && (
                            <ListItem>
                              <Stack direction='row'>
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
