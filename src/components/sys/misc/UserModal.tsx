import React, { useState, useEffect, useCallback } from 'react';
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
import { User } from 'types/misc/user';
import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';

import LoadingModal from '@components/sys/misc/LoadingModal';

import { checkerString } from '@constants/sys/helper';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Renders a modal that contains the information of a specific user
 *
 * @param param0 Modal functions and User Object
 * @returns A modal
 */
export default function UserModal({ isOpen, onClose, modalData }) {
  const [id, setID] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomNum, setRoomNum] = useState('');
  const [studentID, setStudentID] = useState('');
  const [adminStr, setAdminStr] = useState('');

  const [ccaList, setCCAList] = useState<JSX.Element[]>([]);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const reset = useCallback(async () => {
    setID('');
    setName('');
    setEmail('');
    setRoomNum('');
    setStudentID('');
    setAdminStr('');

    setCCAList([]);
  }, []);

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const buildMemberList = useCallback(async (content: CCARecord[]) => {
    if (content.length > 0) {
      const text: JSX.Element[] = [];
      for (let key = 0; key < content.length; key += 1) {
        if (content[key]) {
          if (content[key].leader) {
            text.push(
              <Box key={`box-e-${key}`}>
                <Text>{content[key].ccaName} (Leader)</Text>
              </Box>,
            );
          } else {
            text.push(
              <Box key={`box-e-${key}`}>
                <Text>{content[key].ccaName} (Member)</Text>
              </Box>,
            );
          }
        }
      }

      setCCAList(text);
    } else {
      setCCAList([]);
    }
  }, []);

  const fetchCCARecords = useCallback(
    async (emailField: string) => {
      if (checkerString(emailField)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/ccaRecord/user', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: emailField,
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
    },
    [buildMemberList],
  );

  useEffect(() => {
    async function setupData(modalDataField: User) {
      if (modalDataField.id && checkerString(modalDataField.id)) {
        setID(modalDataField.id);
      } else {
        setID('');
      }

      if (modalDataField.name && checkerString(modalDataField.name)) {
        setName(modalDataField.name);
      } else {
        setName('');
      }

      if (modalDataField.email && checkerString(modalDataField.email)) {
        setEmail(modalDataField.email);
      } else {
        setEmail('');
      }

      if (modalDataField.roomNum && checkerString(modalDataField.roomNum)) {
        setRoomNum(modalDataField.roomNum);
      } else {
        setRoomNum('');
      }

      if (modalDataField.studentID && checkerString(modalDataField.studentID)) {
        setStudentID(modalDataField.studentID);
      } else {
        setStudentID('');
      }

      if (modalDataField.adminStr && checkerString(modalDataField.adminStr)) {
        setAdminStr(modalDataField.adminStr);
      } else {
        setAdminStr('');
      }

      await fetchCCARecords(modalDataField.email);
    }

    if (modalData) {
      setupData(modalData);
    }
  }, [modalData, fetchCCARecords]);

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
              {modalData && (
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
                        <Text
                          fontSize={{ base: '16px', lg: '18px' }}
                          fontWeight='500'
                          textTransform='uppercase'
                          mb='4'
                        >
                          User Details
                        </Text>

                        <List spacing={5}>
                          {checkerString(id) && (
                            <ListItem key='user-id'>
                              <Text as='span' fontWeight='bold'>
                                User ID:{' '}
                              </Text>
                              {id}
                            </ListItem>
                          )}
                          {checkerString(name) && (
                            <ListItem key='user-name'>
                              <Text as='span' fontWeight='bold'>
                                Name:{' '}
                              </Text>
                              {name}
                            </ListItem>
                          )}
                          {checkerString(email) && (
                            <ListItem key='user-email'>
                              <Text as='span' fontWeight='bold'>
                                Email:{' '}
                              </Text>
                              {email}
                            </ListItem>
                          )}
                          {checkerString(studentID) && (
                            <ListItem key='user-stud'>
                              <Text as='span' fontWeight='bold'>
                                Student ID:{' '}
                              </Text>
                              {studentID}
                            </ListItem>
                          )}
                          {checkerString(roomNum) && (
                            <ListItem key='user-rm'>
                              <Text as='span' fontWeight='bold'>
                                Room Num:{' '}
                              </Text>
                              {roomNum}
                            </ListItem>
                          )}
                          {checkerString(adminStr) && (
                            <ListItem key='user-admin'>
                              <Text as='span' fontWeight='bold'>
                                Admin:{' '}
                              </Text>
                              {adminStr}
                            </ListItem>
                          )}

                          {ccaList.length > 0 && (
                            <ListItem key='exp-list'>
                              <Stack direction='column'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  CCAs
                                </Text>
                                {ccaList}
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
