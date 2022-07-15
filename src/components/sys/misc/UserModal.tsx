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
import { checkerString } from '@constants/sys/helper';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function UserModal({ isOpen, onClose, modalData }) {
  const [id, setID] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomNum, setRoomNum] = useState('');
  const [studentID, setStudentID] = useState('');
  const [adminStr, setAdminStr] = useState('');

  const reset = useCallback(async () => {
    setID('');
    setName('');
    setEmail('');
    setRoomNum('');
    setStudentID('');
    setAdminStr('');
  }, []);

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

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
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                User ID:
                              </Text>{' '}
                              {id}
                            </ListItem>
                          )}
                          {checkerString(name) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Name:
                              </Text>{' '}
                              {name}
                            </ListItem>
                          )}
                          {checkerString(email) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Email:
                              </Text>{' '}
                              {email}
                            </ListItem>
                          )}
                          {checkerString(studentID) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Student ID
                              </Text>{' '}
                              {studentID}
                            </ListItem>
                          )}
                          {checkerString(roomNum) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Room Num:
                              </Text>{' '}
                              {roomNum}
                            </ListItem>
                          )}
                          {checkerString(adminStr) && (
                            <ListItem>
                              <Text as='span' fontWeight='bold'>
                                Admin:
                              </Text>{' '}
                              {adminStr}
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