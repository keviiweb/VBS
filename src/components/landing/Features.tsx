import { chakra, Box, Flex, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

import Map from '@components/landing/Map';
import { layoutVariant } from '@root/motion';

const MotionBox = motion(Box);

/**
 * Renders the features page for the landing page
 *
 * 1. Contains a Google Map component for KEVII location
 * 2. Text beside the Map
 *
 * @param param0 API Key for Google Maps
 * @returns Features component for landing page
 */
export default function Feature ({ API_KEY }) {
  const location = {
    address: '1A Kent Ridge Rd, Singapore 119224',
    lat: 1.2925423384337875,
    lng: 103.78102165309795
  };

  return (
    <MotionBox
      id='features'
      initial='offscreen'
      whileInView='onscreen'
      viewport={{ once: true, amount: 0.2 }}
    >
      <MotionBox variants={layoutVariant}>
        <Flex
          bg='#F9FAFB'
          p={{ base: 4, md: 8, lg: 12, xl: 20 }}
          w='full'
          justifyContent='center'
          alignItems='center'
        >
          <SimpleGrid columns={{ base: 1, md: 1, lg: 1, xl: 2 }}>
            <Flex
              direction='column'
              alignItems='start'
              justifyContent='center'
              px={{ base: 4, md: 8, lg: 12, xl: 20 }}
              py={24}
              zIndex={1}
            >
              <chakra.h2
                fontSize={{ base: '3xl', sm: '4xl' }}
                fontWeight='extrabold'
                lineHeight='shorter'
                color='brand.600'
                mb={6}
              >
                <chakra.span display='block'>
                  Experience the life of a KEVIIAN
                </chakra.span>
              </chakra.h2>
              <chakra.p
                pr={{ base: 0, lg: 16 }}
                mb={4}
                fontSize='lg'
                color='brand.600'
                letterSpacing='wider'
              >
                Applications will be open on 16 May 2022 until 6 June 2022. Do
                visit the NUS OSA website for more details on the application
                process. Do also follow us on our socials to receive timely
                updates about the Hall, reminders and other important
                information!
              </chakra.p>

              <Box display='inline-flex' rounded='md' shadow='md'>
                <chakra.a
                  display='inline-flex'
                  alignItems='center'
                  justifyContent='center'
                  px={5}
                  py={3}
                  border='solid transparent'
                  fontWeight='bold'
                  w='full'
                  rounded='md'
                  color='white'
                  bg='gray.600'
                  _hover={{
                    bg: 'teal.700'
                  }}
                  href='https://nus.edu.sg/osa/student-services/hostel-admission/undergraduate/application-dates'
                >
                  Hall Application
                </chakra.a>
              </Box>
            </Flex>
            {API_KEY && (
              <Flex
                bg='#F9FAFB'
                p={{ base: 4, md: 8, lg: 12, xl: 17 }}
                w='auto'
                justifyContent='center'
                alignItems='center'
              >
                <Box w='full'>
                  <Map location={location} zoomLevel={21} apiKey={API_KEY} />
                </Box>
              </Flex>
            )}
          </SimpleGrid>
        </Flex>
      </MotionBox>
    </MotionBox>
  );
}
