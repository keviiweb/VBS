import React from 'react';
import Landing from '@layout/landing';
import { Box, Flex, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { layoutVariant } from '@root/motion';

const MotionBox = motion(Box);

/**
 * Renders a contact us page, with address of KE, email etc
 *
 * @returns Contact Us Page
 */
export default function ContactUs() {
  return (
    <Landing>
      <MotionBox
        id='contact'
        initial='offscreen'
        whileInView='onscreen'
        viewport={{ once: true, amount: 0.2 }}
      >
        <MotionBox variants={layoutVariant}>
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
                  LOCATE US
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
                  We are minutes away by foot or bus from your schools! Buses
                  are available right at our doorstep
                </Text>
                <Text
                  style={{ whiteSpace: 'pre-line' }}
                  mt={2}
                  fontSize='md'
                  color='gray.600'
                >
                  Keep updated on our socials if you would like to get updates
                  on our upcoming activities. {'\n'}
                  {'\n'}
                  If you have any questions, do not hesitate to email us at
                  kehhelp@nus.edu.sg. {'\n'}
                  {'\n'}
                  Address: 1A Kent Ridge Road, S(119224) {'\n'}
                  Phone: +65 6516 5774 {'\n'}
                  Email Address: kehhelp@nus.edu.sg {'\n'}
                  Facebook: @keviihall {'\n'}
                  Instagram: @kingedwardviihall
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
              >
                <Image
                  w='full'
                  rounded='lg'
                  shadow='2xl'
                  src='/landing/contact/farewell.png'
                  alt='KEVIIAN Farewell Photo'
                />
              </MotionBox>
            </Flex>
          </SimpleGrid>
        </MotionBox>
      </MotionBox>
    </Landing>
  );
}
