import React from 'react';
import Landing from '@layout/landing';
import Card from '@components/landing/Card';
import { SimpleGrid, Flex, Stack, Box, Text } from '@chakra-ui/react';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);

/**
 * Renders the /committee page that contains the list of commoitee CCA in KE
 *
 * For future addition of Committee CCA
 *
 * @returns Committee Page
 */
export default function Committee() {
  const content = [
    {
      img: '/landing/cca/landing_keweb.png',
      title: 'KE Web',
      description: 'We work hard to give you the website you deserve.',
      link: '/landing/keweb',
    },
    {
      img: '/landing/cca/landing_dnd.jpg',
      title: 'DND',
      description: 'Craft an unforgettable night!',
      link: '/landing/dnd',
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
        {content.map(
          (
            slide: {
              img: string;
              title: string;
              description: string;
              link: string;
            },
            sid,
          ) => (
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
          ),
        )}
      </MotionSimpleGrid>
    </Landing>
  );
}
