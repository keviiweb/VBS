import React, { useEffect, useState } from 'react';
import { Box, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react';

import safeJsonStringify from 'safe-json-stringify';
import { GetServerSideProps } from 'next';

import { currentSession } from '@helper/sys/sessionServer';

import Auth from '@components/sys/Auth';

import { CCARecord } from 'types/cca/ccaRecord';
import { Result } from 'types/api';
import { Session } from 'next-auth/core/types';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import CCACard from '@components/sys/cca/CCACard';
import LeaderModalComponent from '@components/sys/cca/LeaderModal';
import MemberModalComponent from '@components/sys/cca/MemberModal';
import LoadingModal from '@components/sys/misc/LoadingModal';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function CCA(props: any) {
  const [leaderModalData, setLeaderModalData] = useState(null);
  const [memberModalData, setMemberModalData] = useState(null);

  const [leaderCards, setLeaderCards] = useState<JSX.Element[]>([]);
  const [memberCards, setMemberCards] = useState<JSX.Element[]>([]);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  useEffect(() => {
    async function generate(propsField: any) {
      setSubmitButtonPressed(true);

      const propRes = await propsField;
      if (propRes.data) {
        const res: Result = propRes.data;
        if (res.status && res.msg.count > 0) {
          const resField: { count: number; res: CCARecord[] } = res.msg;
          const result: CCARecord[] = resField.res;
          if (result !== [] && result !== null && result !== undefined) {
            const leaderRes: JSX.Element[] = [];
            const memberRes: JSX.Element[] = [];
            result.forEach((item) => {
              const itemField: CCARecord = item;
              if (itemField.leader) {
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

      setSubmitButtonPressed(false);
    }

    generate(props);
  }, [props]);

  return (
    <Auth admin={undefined}>
      <LoadingModal
        isOpen={!!submitButtonPressed}
        onClose={() => setSubmitButtonPressed(false)}
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
                    <Text>You are not in any CCAs...</Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>
      )}

      <LeaderModalComponent
        isOpen={leaderModalData}
        onClose={() => setLeaderModalData(null)}
        modalData={leaderModalData}
      />
      <MemberModalComponent
        isOpen={memberModalData}
        onClose={() => setMemberModalData(null)}
        modalData={memberModalData}
      />
    </Auth>
  );
}

export const getServerSideProps: GetServerSideProps = async (cont) => ({
  props: (async function Props() {
    try {
      const session: Session | null = await currentSession(null, null, cont);
      if (session !== null && process.env.NEXTAUTH_URL !== undefined) {
        try {
          const rawResponse = await fetch(
            `${process.env.NEXTAUTH_URL}/api/ccaRecord/fetch`,
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            },
          );

          const content: Result = await rawResponse.json();
          const stringifiedData = safeJsonStringify(content);
          const data: Result = JSON.parse(stringifiedData);
          return {
            data: data,
          };
        } catch (error) {
          console.error(error);
        }

        return {
          data: null,
        };
      }
      return {
        data: null,
      };
    } catch (error) {
      console.error(error);
      return {
        data: null,
      };
    }
  })(),
});
