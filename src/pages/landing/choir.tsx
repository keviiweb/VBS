import React from 'react';
import Landing from '@layout/landing';
import { Box, Flex, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { layoutVariant } from '@root/motion';

const MotionBox = motion(Box);

/**
 * Part of the list of CCA Pages
 *
 * CCA: Choir
 *
 * @returns Choir Page
 */
export default function Choir() {
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
                Choir
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
                &quot;Harmonious symphonies&quot;
              </Text>
              <Text
                style={{ whiteSpace: 'pre-line' }}
                mt={2}
                fontSize='md'
                color='gray.600'
              >
                Calling all music enthusiasts and vocal virtuosos! {'\n'} 
                If you've got a passion for singing and a desire to showcase your vocal talents, look no further, Choir is the perfect place for you! {'\n'} 
                Join us for an unforgettable musical journey where you can sing your hearts out and harmonize with like-minded individuals. {'\n'}
                Whether you're an experienced singer or just starting to explore your vocal potential, Choir provides a welcoming space for everyone. {'\n'}
                Let your voice be heard, and together, let's create beautiful melodies that resonate with the joy of singing. {'\n'}
                Join Choir and embark on a musical adventure where your passion takes center stage! {'\n'}
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
                src='/landing/cca/landing_acake.png' // for now
                alt='Choir'
              />
            </MotionBox>
          </Flex>
        </SimpleGrid>
      </MotionBox>
    </Landing>
  );
}
