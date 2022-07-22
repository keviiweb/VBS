import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from '@chakra-ui/react';
import { BsPerson } from 'react-icons/bs';
import { MdOutlineEmail, MdAccountBox, MdLocationOn } from 'react-icons/md';

import Auth from '@components/sys/Auth';
import Loading from '@components/sys/misc/Loading';

import { currentSession } from '@helper/sys/session';
import { checkerString } from '@constants/sys/helper';

/**
 * Renders a profile page for the user to check their name and email
 *
 * @returns Profile Page
 */
export default function Profile() {
  const [studentID, setStudentID] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const session = await currentSession();
      const studentIDField: string =
        session && session.user.studentID ? session.user.studentID : '';
      const usernameField: string =
        session && session.user.username ? session.user.username : '';
      const emailField: string =
        session && session.user.email ? session.user.email : '';
      const roomField: string =
        session && session.user.roomNum ? session.user.roomNum : '';

      setStudentID(studentIDField);
      setUsername(usernameField);
      setEmail(emailField);
      setRoom(roomField);

      setLoading(true);
    }

    fetchData();
  }, []);

  return (
    <Auth admin={undefined}>
      {loading && (
        <Flex bg='gray.100' align='center' justify='center' id='profile'>
          <Box
            borderRadius='lg'
            m={{ base: 5, md: 5, lg: 5 }}
            p={{ base: 5, lg: 7 }}
          >
            <Box>
              <VStack spacing={{ base: 4, md: 8, lg: 10 }}>
                <Heading
                  fontSize={{
                    base: '4xl',
                    md: '5xl',
                  }}
                >
                  Profile
                </Heading>

                <Box
                  bg='white'
                  borderRadius='lg'
                  p={8}
                  color='gray.700'
                  shadow='base'
                >
                  <VStack spacing={5}>
                    {checkerString(username) && (
                      <FormControl isDisabled>
                        <FormLabel>Name</FormLabel>

                        <InputGroup>
                          <InputLeftElement>
                            <BsPerson />
                          </InputLeftElement>
                          <Input
                            type='text'
                            name='name'
                            placeholder='Your Name'
                            value={username}
                          />
                        </InputGroup>
                      </FormControl>
                    )}

                    {checkerString(email) && (
                      <FormControl isDisabled>
                        <FormLabel>Email</FormLabel>

                        <InputGroup>
                          <InputLeftElement>
                            <MdOutlineEmail />
                          </InputLeftElement>
                          <Input
                            type='email'
                            name='email'
                            placeholder='Your Email'
                            value={email}
                          />
                        </InputGroup>
                      </FormControl>
                    )}

                    {checkerString(studentID) && (
                      <FormControl isDisabled>
                        <FormLabel>Student ID</FormLabel>

                        <InputGroup>
                          <InputLeftElement>
                            <MdAccountBox />
                          </InputLeftElement>
                          <Input
                            type='text'
                            name='studentID'
                            placeholder='Your Student ID'
                            value={studentID}
                          />
                        </InputGroup>
                      </FormControl>
                    )}

                    {checkerString(room) && (
                      <FormControl isDisabled>
                        <FormLabel>Room Number</FormLabel>

                        <InputGroup>
                          <InputLeftElement>
                            <MdLocationOn />
                          </InputLeftElement>
                          <Input
                            type='text'
                            name='roomNum'
                            placeholder='Your Room Number'
                            value={room}
                          />
                        </InputGroup>
                      </FormControl>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>
      )}
      {!loading && (
        <Box>
          <Loading message='Loading profile...' />
        </Box>
      )}
    </Auth>
  );
}
