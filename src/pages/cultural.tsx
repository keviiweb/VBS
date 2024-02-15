import React from 'react';
import Landing from '@layout/landing';
import Card from '@components/landing/Card';
import { SimpleGrid, Flex, Stack, Box, Text } from '@chakra-ui/react';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);

/**
 * Renders the /cultural page that contains the list of cultural CCA in KE
 *
 * For future addition of Cultural CCA
 *
 * @returns Cultural Page
 */
export default function Cultural() {
  // Format for adding new CCAs
  const content = [
    {
      img: '/landing/cca/landing_acake.png', // for now
      title: 'Choir',
      description: 'We sing and we make music!',
      link: '/landing/choir',
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
              KING EDWARD VII CULTURAL
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
