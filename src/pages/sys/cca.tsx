import React, { useEffect, useState } from 'react';
import { Box, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react';

import safeJsonStringify from 'safe-json-stringify';
import { type GetServerSideProps } from 'next';

import { currentSession } from '@helper/sys/sessionServer';
import { fetchAllCCARecordByUserWDetails } from '@helper/sys/cca/ccaRecord';

import Auth from '@components/sys/Auth';

import { type CCARecord } from 'types/cca/ccaRecord';
import { type Result } from 'types/api';
import { type Session } from 'next-auth/core/types';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import CCACard from '@components/sys/cca/CCACard';
import LeaderModalComponent from '@components/sys/cca/LeaderModal';
import MemberModalComponent from '@components/sys/cca/MemberModal';
import LoadingModal from '@components/sys/misc/LoadingModal';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Entry point for the CCA attendance component
 *
 * Renders a page filled with cards of the user's CCA
 *
 * @param props List of CCAs
 * @returns CCA Page
 */
export default function CCA(props: any) {
  const [leaderModalData, setLeaderModalData] = useState(null);
  const [memberModalData, setMemberModalData] = useState(null);

  const [leaderCards, setLeaderCards] = useState<JSX.Element[]>([]);
  const [memberCards, setMemberCards] = useState<JSX.Element[]>([]);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const [calendarThreshold, setCalendarThreshold] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function generate(propsField: any) {
      setSubmitButtonPressed(true);
      if (propsField.data !== undefined && propsField.data !== null) {
        const res: Result = propsField.data;
        if (res.status && res.msg.length > 0) {
          const result: CCARecord[] = res.msg;
          if (result !== null && result !== undefined && result.length > 0) {
            const leaderRes: JSX.Element[] = [];
            const memberRes: JSX.Element[] = [];
            result.forEach((item) => {
              const itemField: CCARecord = item;
              if (itemField.leader !== undefined && itemField.leader) {
                leaderRes.push(
                  <MotionBox
                    mt={5}
                    id={itemField.ccaID}
                    key={`leader_${itemField.id}`}
                  >
                    <CCACard
                      product={itemField}
                      setModalData={setLeaderModalData}
                    />
                  </MotionBox>,
                );
              } else {
                memberRes.push(
                  <MotionBox
                    id={itemField.ccaID}
                    key={`member_${itemField.id}`}
                  >
                    <CCACard
                      product={itemField}
                      setModalData={setMemberModalData}
                    />
                  </MotionBox>,
                );
              }
            });

            setLeaderCards(leaderRes);
            setMemberCards(memberRes);
          }
        }
      }

      if (propsField.threshold !== undefined) {
        setCalendarThreshold(propsField.threshold as string);
      }

      if (propsField.userSession !== undefined) {
        setSession(propsField.userSession as Session);
      }

      setSubmitButtonPressed(false);
    }

    generate(props);
  }, [props]);

  return (
    <Auth admin={undefined}>
      <LoadingModal
        isOpen={!!submitButtonPressed}
        onClose={() => {
          setSubmitButtonPressed(false);
        }}
      />

      {leaderCards.length > 0 && (
        <Box>
          <Text
            mt={2}
            mb={6}
            fontSize={{ base: '2xl', sm: '2xl', lg: '3xl' }}
            lineHeight='5'
            fontWeight='bold'
            letterSpacing='tight'
            color='gray.900'
          >
            LEADER
          </Text>
          <MotionSimpleGrid
            mt='3'
            minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            {leaderCards}
          </MotionSimpleGrid>
        </Box>
      )}

      {memberCards.length > 0 && (
        <Box>
          {' '}
          <Text
            mt={10}
            mb={6}
            fontSize={{ base: '2xl', sm: '2xl', lg: '3xl' }}
            lineHeight='5'
            fontWeight='bold'
            letterSpacing='tight'
            color='gray.900'
          >
            MEMBER
          </Text>
          <MotionSimpleGrid
            mt='3'
            minChildWidth={{ base: 'full', md: '300px', lg: '300px' }}
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            {memberCards}
          </MotionSimpleGrid>{' '}
        </Box>
      )}

      {leaderCards.length === 0 && memberCards.length === 0 && (
        <Flex bg='gray.100' align='center' justify='center' id='cca'>
          <Box
            borderRadius='lg'
            m={{ base: 5, md: 16, lg: 10 }}
            p={{ base: 5, lg: 16 }}
          >
            <Box>
              <VStack spacing={{ base: 4, md: 8, lg: 20 }}>
                <Box
                  bg='white'
                  borderRadius='lg'
                  p={8}
                  color='gray.700'
                  shadow='base'
                >
                  <VStack spacing={5}>
                    <Text>You are not registered in any CCAs here...</Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>
      )}

      <LeaderModalComponent
        isOpen={leaderModalData}
        onClose={() => {
          setLeaderModalData(null);
        }}
        calendarThreshold={calendarThreshold}
        modalData={leaderModalData}
        userSession={session}
      />
      <MemberModalComponent
        isOpen={memberModalData}
        onClose={() => {
          setMemberModalData(null);
        }}
        modalData={memberModalData}
        userSession={session}
      />
    </Auth>
  );
}

export const getServerSideProps: GetServerSideProps = async (cont) => {
  cont.res.setHeader(
    'Cache-Control',
    'public, s-maxage=7200, stale-while-revalidate=100000',
  );

  let data: Result | null = null;
  let session: Session | null = null;

  try {
    session = await currentSession(null, null, cont);
    if (session !== null) {
      const res: Result = await fetchAllCCARecordByUserWDetails(session);
      const stringifiedData = safeJsonStringify(res);
      data = JSON.parse(stringifiedData);
    }
  } catch (error) {
    console.error(error);
  }

  return {
    props: {
      data,
      userSession: session,
      threshold: process.env.SESSION_EDITABLE_DAY,
    },
  };
};
