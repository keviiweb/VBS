import React, { useCallback, useEffect, useState } from 'react';
import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';
import { Result } from 'types/api';
import { Announcement } from 'types/misc/announcement';

import LinkCard from '@components/sys/misc/LinkCard';
import AnnouncementCard from './AnnouncementCard';

const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);

/**
 * Fetches all announcements and renders them in cards
 *
 * @returns A component containing the list of announcements
 */
export default function AnnouncementComponent() {
  const [slides, setSlides] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const populateData = useCallback(async (content: Announcement[]) => {
    setSlides(content);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        const rawResponse = await fetch('/api/announcement/fetch', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const content: Result = await rawResponse.json();
        if (content.status) {
          await populateData(content.msg);
        }
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    }

    fetchData();
  }, [populateData]);

  return (
    <MotionBox
      id='announcements'
      initial='offscreen'
      whileInView='onscreen'
      viewport={{ once: true, amount: 0.2 }}
    >
      {!loading && slides.length > 0 && (
        <Text
          mt={2}
          mb={6}
          fontSize={{ base: '2xl', sm: '3xl', lg: '4xl' }}
          lineHeight='5'
          fontWeight='bold'
          letterSpacing='tight'
          color='gray.900'
        >
          CURRENT EVENTS
        </Text>
      )}

      {!loading && slides.length > 0 && (
        <MotionSimpleGrid
          columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
          pos='relative'
          gap={{ base: 8, sm: 10 }}
          px={5}
          py={6}
          p={{ sm: 8 }}
          variants={parentVariant}
          initial='initial'
          animate='animate'
        >
          {slides.map((slide, sid) => (
            <MotionBox key={sid} variants={cardVariant}>
              <AnnouncementCard product={slide} />
            </MotionBox>
          ))}
        </MotionSimpleGrid>
      )}

      {!loading && slides.length === 0 && (
        <MotionSimpleGrid
          mt='3'
          minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
          spacing='2em'
          minH='full'
          variants={parentVariant}
          initial='initial'
          animate='animate'
        >
          <MotionBox variants={cardVariant} key='vbs-card'>
            <LinkCard
              product={{
                img: '/sys/image/vbs.png',
                title: 'Book a Venue',
                link: '/sys/vbs',
              }}
            />
          </MotionBox>

          <MotionBox variants={cardVariant} key='cca-card'>
            <LinkCard
              product={{
                img: '/sys/image/cca.png',
                title: 'CCA Attendance',
                link: '/sys/cca',
              }}
            />
          </MotionBox>

          <MotionBox variants={cardVariant} key='keips-card'>
            <LinkCard
              product={{
                img: '/sys/image/keips.png',
                title: 'Check your KEIPS',
                link: '/sys/keips',
              }}
            />
          </MotionBox>
        </MotionSimpleGrid>
      )}
    </MotionBox>
  );
}
