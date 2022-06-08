import React from 'react';
import Landing from '@layout/landing';
import { chakra, Image, Flex, Stack, Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { layoutVariant } from '@root/motion';

export default function Cultural() {
  return (
    <Landing>
      <motion.div
        className='card-container'
        initial='offscreen'
        whileInView='onscreen'
        viewport={{ once: true, amount: 0.8 }}
      >
        <motion.div className='card' variants={layoutVariant}>
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
                  fontSize={{
                    base: '3xl',
                    sm: '4xl',
                    lg: '5xl',
                  }}
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

          <Flex
            direction={{ base: 'column', md: 'row' }}
            justifyContent='center'
            alignItems='center'
            bg='#F9FAFB'
            px={16}
            py={24}
            mx='auto'
          >
            <Box
              w={{ base: 'full', md: 5 / 12, xl: 8 / 12 }}
              mx='auto'
              pr={{ md: 20 }}
            >
              <chakra.h2
                fontSize={{ base: '3xl', sm: '4xl' }}
                fontWeight='extrabold'
                lineHeight='shorter'
                color='brand.600'
                mb={6}
              >
                <chakra.span display='block'>
                  We are minutes away by foot or bus from your schools! Buses
                  are available right at our doorstep
                </chakra.span>
              </chakra.h2>
              <Text
                style={{ whiteSpace: 'pre-line' }}
                mt={2}
                fontSize='md'
                color='gray.600'
              >
                Keep updated on our socials if you would like to get updates on
                our upcoming activities. {'\n'}
                If you have any questions, do not hesitate to email us at
                kehhelp@nus.edu.sg. {'\n'}
                {'\n'}
                Address: 1A Kent Ridge Road, S(119224) {'\n'}
                Phone: +65 6516 5774 {'\n'}
                Email Address: kehhelp@nus.edu.sg {'\n'}
                Facebook: @keviihall {'\n'}
                Instagram: @kingedwardviihall
              </Text>
            </Box>
            <Box w={{ base: 'full', md: 7 / 12 }} mx='auto' textAlign='center'>
              <motion.div
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
              </motion.div>
            </Box>
          </Flex>
        </motion.div>
      </motion.div>
    </Landing>
  );
}
