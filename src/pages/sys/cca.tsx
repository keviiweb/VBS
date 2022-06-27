import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Text } from '@chakra-ui/react';

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

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function CCA(props: any) {
  const [modalData, setModalData] = useState(null);

  const [leaderCards, setLeaderCards] = useState<JSX.Element[]>([]);
  const [memberCards, setMemberCards] = useState<JSX.Element[]>([]);

  useEffect(() => {
    async function generate(propsField: any) {
      const propRes = await propsField;
      if (propRes.data) {
        const res: Result = propRes.data;
        if (res.msg.length > 0) {
          if (res.status) {
            const result: CCARecord[] = res.msg;
            if (result !== [] && result !== null && result !== undefined) {
              const leaderRes: JSX.Element[] = [];
              const memberRes: JSX.Element[] = [];
              result.forEach((item) => {
                if (item.leader) {
                  leaderRes.push(
                    <MotionBox id={item.ccaID} key={item.id}>
                      <CCACard product={item} setModalData={setModalData} />
                    </MotionBox>,
                  );
                } else {
                  memberRes.push(
                    <MotionBox id={item.ccaID} key={item.id}>
                      <CCACard product={item} setModalData={setModalData} />
                    </MotionBox>,
                  );
                }
              });

              setLeaderCards(leaderRes);
              setMemberCards(memberRes);
            }
          }
        }
      }
    }

    generate(props);
  }, [props]);

  return (
    <Auth admin={undefined}>
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
            minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            {memberCards}
          </MotionSimpleGrid>{' '}
        </Box>
      )}

      {modalData}
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
