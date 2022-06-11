import React from 'react';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';
import { Box, SimpleGrid } from '@chakra-ui/react';
import Auth from '@components/sys/Auth';
import Card from '@components/sys/vbs/Card';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function Home() {
  return (
    <Auth admin={undefined}>
      <Box>
        <MotionSimpleGrid
          mt='3'
          minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
          spacing='2em'
          minH='full'
          variants={parentVariant}
          initial='initial'
          animate='animate'
        >
          <MotionBox variants={cardVariant} key='1'>
            <Card
              product={{
                img: '/sys/image/vbs.png',
                title: 'Book a Venue',
                link: '/sys/vbs',
              }}
            />
          </MotionBox>

          <MotionBox variants={cardVariant} key='2'>
            <Card
              product={{
                img: '/sys/image/cca.png',
                title: 'CCA Attendance',
                link: '/sys/cca',
              }}
            />
          </MotionBox>

          <MotionBox variants={cardVariant} key='3'>
            <Card
              product={{
                img: '/sys/image/keips.png',
                title: 'Check your KEIPS',
                link: '/sys/keips',
              }}
            />
          </MotionBox>
        </MotionSimpleGrid>
      </Box>
    </Auth>
  );
}
