import React from 'react';
import Landing from '@layout/landing';
import { Box, Flex, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { layoutVariant } from '@root/motion';

const MotionBox = motion(Box);

/**
 * Part of the list of CCA Pages
 *
 * CCA: MAB
 *
 * @returns MAB Page
 */
export default function MAB() {
  return (
    <Landing>
      <MotionBox
        id='contact'
        initial='offscreen'
        whileInView='onscreen'
        viewport={{ once: true, amount: 0.2 }}
        variants={layoutVariant}
      >
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
                fontSize={{ base: '3xl', sm: '4xl', lg: '5xl' }}
                lineHeight='8'
                fontWeight='extrabold'
                letterSpacing='tight'
                color='gray.900'
              >
                Merit Award Board (MAB)
              </Text>
            </Box>
          </Stack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 1, lg: 1, xl: 2 }}>
          <Flex
            bg='#F9FAFB'
            p={{ base: 4, md: 8, lg: 12, xl: 20 }}
            w='full'
            justifyContent='center'
            alignItems='center'
          >
            <Flex
              direction='column'
              alignItems='start'
              justifyContent='center'
              px={{ base: 4, md: 8, lg: 12, xl: 20 }}
              py={{ base: 4, md: 8, lg: 12, xl: 20 }}
              zIndex={1}
            >
              <Text
                fontSize={{ base: '3xl', sm: '4xl' }}
                fontWeight='extrabold'
                lineHeight='shorter'
                color='brand.600'
                mb={6}
                display='block'
              >
                &quot;Recognizing your potential&quot;
              </Text>
              <Text
                style={{ whiteSpace: 'pre-line' }}
                mt={2}
                fontSize='md'
                color='gray.600'
              >
                Let's come together and celebrate the outstanding achievements of our esteemed KEVIIans! {'\n'}
                The Merit Award Board takes pride in organising the annual award ceremony, where we shine a spotlight on the exceptional accomplishments of our community members. {'\n'}
                From planning to publicity, logistics, and beyond, there's a role for everyone to play in making this event a resounding success. {'\n'}
                Join us in honouring the hard work and dedication of our brilliant individuals. {'\n'}
                Be part of the team that makes it all happen, because at Merit Award Board, we believe in recognizing and celebrating excellence! Get involved, and let's make this year's ceremony one for the books! {'\n'}  
              </Text>
            </Flex>
          </Flex>

          <Flex
            bg='#F9FAFB'
            p={{ base: 12, md: 14, lg: 16, xl: 20 }}
            w='full'
            justifyContent='center'
            alignItems='center'
          >
            <MotionBox
              animate={{ scale: 1.1 }}
              transition={{ duration: 1.0 }}
              key='image'
            >
              <Image
                w='full'
                rounded='lg'
                shadow='2xl'
                src='/landing/cca/landing_mab.png'
                alt='MAB'
              />
            </MotionBox>
          </Flex>
        </SimpleGrid>
      </MotionBox>
    </Landing>
  );
}
