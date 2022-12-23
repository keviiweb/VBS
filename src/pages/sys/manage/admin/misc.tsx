import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Box,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';
import LoadingModal from '@components/sys/misc/LoadingModal';

import Auth from '@components/sys/Auth';
import { actions, levels } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

import { GetServerSideProps } from 'next';
import { currentSession } from '@helper/sys/sessionServer';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Renders a component that displays the list of venues available for booking, and allow users to create or edit venues.
 *
 * Creating and Editing a venue is an OWNER-level task only
 *
 * @param props Permission level of user
 * @returns Manage Venues page
 */
export default function ManageVenues(props: any) {
  const toast = useToast();

  const [level, setLevel] = useState(levels.USER);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const handleDeleteAllLogs = useCallback(async () => {
    setSubmitButtonPressed(true);

    try {
      const rawResponse = await fetch('/api/log/delete', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        toast({
          title: 'Logs',
          description: content.msg,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: content.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }

    setSubmitButtonPressed(false);
  }, [toast]);

  const handleDeleteAllBooking = useCallback(async () => {
    setSubmitButtonPressed(true);

    try {
      const rawResponse = await fetch('/api/booking/delete', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        toast({
          title: 'Booking',
          description: content.msg,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: content.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }

    setSubmitButtonPressed(false);
  }, [toast]);

  const handleDeleteAllBookingRequest = useCallback(async () => {
    setSubmitButtonPressed(true);

    try {
      const rawResponse = await fetch('/api/bookingReq/delete', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        toast({
          title: 'Booking Request',
          description: content.msg,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: content.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
    }

    setSubmitButtonPressed(false);
  }, [toast]);

  useEffect(() => {
    async function generate(propsField: any) {
      setLevel(propsField.data);
    }

    generate(props);
  }, [props]);

  return (
    <Auth admin>
      <LoadingModal
        isOpen={!!submitButtonPressed}
        onClose={() => setSubmitButtonPressed(false)}
      />
      <MotionSimpleGrid
        mt='3'
        minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
        minH='full'
        variants={parentVariant}
        initial='initial'
        animate='animate'
      >
        {hasPermission(level, actions.DELETE_LOGS) && (
          <MotionBox key='delete-all-logs'>
            <Stack
              spacing={4}
              w='full'
              maxW='md'
              bg='white'
              rounded='xl'
              boxShadow='lg'
              p={6}
              my={12}
            >
              <Heading size='md'>Delete All Logs</Heading>
              <Stack spacing={4}>
                <Text>
                  This action will delete all logs stored in the database.
                </Text>
                <Button
                  type='submit'
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                  onClick={handleDeleteAllLogs}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </MotionBox>
        )}

        {hasPermission(level, actions.DELETE_BOOKING) && (
          <MotionBox key='delete-all-booking'>
            <Stack
              spacing={4}
              w='full'
              maxW='md'
              bg='white'
              rounded='xl'
              boxShadow='lg'
              p={6}
              my={12}
            >
              <Heading size='md'>Delete All Bookings</Heading>
              <Stack spacing={4}>
                <Text>
                  This action will delete all approved bookings stored in the
                  database.
                </Text>
                <Button
                  type='submit'
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                  onClick={handleDeleteAllBooking}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </MotionBox>
        )}

        {hasPermission(level, actions.DELETE_BOOKING_REQUEST) && (
          <MotionBox key='delete-all-bookingreq'>
            <Stack
              spacing={4}
              w='full'
              maxW='md'
              bg='white'
              rounded='xl'
              boxShadow='lg'
              p={6}
              my={12}
            >
              <Heading size='md'>Delete All Booking Requests</Heading>
              <Stack spacing={4}>
                <Text>
                  This action will delete all booking requests stored in the
                  database.
                </Text>
                <Button
                  type='submit'
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                  onClick={handleDeleteAllBookingRequest}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </MotionBox>
        )}
      </MotionSimpleGrid>
    </Auth>
  );
}

export const getServerSideProps: GetServerSideProps = async (cont) => {
  cont.res.setHeader(
    'Cache-Control',
    'public, s-maxage=7200, stale-while-revalidate=100000',
  );

  let data: number = levels.USER;
  try {
    const session: Session | null = await currentSession(null, null, cont);
    if (session !== null) {
      data = session.user.admin;
    }
  } catch (error) {
    console.error(error);
  }

  return {
    props: {
      data,
    },
  };
};
