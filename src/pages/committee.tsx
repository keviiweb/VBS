import React from 'react';
import Landing from '@layout/landing';
import Card from '@components/landing/Card';
import { SimpleGrid, Flex, Stack, Box, Text } from '@chakra-ui/react';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);

export default function Committee() {
  const content = [
    {
      img: '/landing/event/ihg.png',
      title: 'KE Web',
      description: 'We work hard to give you the website you deserve.',
      link: '/landing/keweb',
    },
  ];

  return (
    <Landing>
      <Flex
        w='full'
        bg='#F9FAFB'
        p={10}
        alignItems='center'
        justifyContent='center'
      >
        <Stack>
          <Box textAlign='center'>
            <Text
              mt={2}
              mb={10}
              fontSize={{ base: '2xl', sm: '3xl', lg: '4xl' }}
              lineHeight='8'
              fontWeight='extrabold'
              letterSpacing='tight'
              color='gray.900'
            >
              KING EDWARD VII COMMITTEE
            </Text>
          </Box>
        </Stack>
      </Flex>
      <MotionSimpleGrid
        columns={{ base: 1, md: 1, lg: 1, xl: 2 }}
        pos='relative'
        gap={{ base: 6, sm: 8 }}
        px={5}
        py={6}
        p={{ sm: 8 }}
        variants={parentVariant}
        initial='initial'
        animate='animate'
      >
        {content.map((slide, sid) => (
          <MotionBox key={sid} variants={cardVariant}>
            <Card
              key={sid}
              title={slide.title}
              description={slide.description}
              img={slide.img}
              link={slide.link}
              buttonLink={null}
              buttonText={null}
            />
          </MotionBox>
        ))}
      </MotionSimpleGrid>
    </Landing>
  );
}
