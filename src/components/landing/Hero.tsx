import {
  Box,
  Stack,
  Flex,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

const MotionBox = motion(Box);

/**
 * Renders the Hero component of a typical website, which consists of the Open House video and some Text
 *
 * @returns A Hero component
 */
export default function Hero() {
  return (
    <Flex
      w='full'
      h={{ base: '15em', md: '28em', lg: '37em', xl: '52em', '2xl': '54em' }}
    >
      <video width='full' autoPlay muted loop id='myVideo'>
        <source
          src='https://nus.edu.sg/osa/videos/default-source/kevii-videos/promo-final-2.mp4?sfvrsn=2ad1ed6f_0'
          type='video/mp4'
        />
        Promotional Video
      </video>

      <VStack
        w='full'
        justify='center'
        bgGradient='linear(to-r, blackAlpha.600, transparent)'
        h='auto'
      >
        <Stack>
          <MotionBox animate={{ scale: 1.2 }} transition={{ duration: 0.5 }}>
            <Text
              color='white'
              fontWeight={700}
              lineHeight={1.2}
              fontSize={useBreakpointValue({
                base: 'xl',
                md: '3xl',
                lg: '4xl',
                xl: '5xl',
              })}
            >
              To Strive, To Seek, To Serve
            </Text>
          </MotionBox>
        </Stack>
      </VStack>
    </Flex>
  );
}
