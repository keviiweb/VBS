import {
  Stack,
  Flex,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

export default function Hero() {
  return (
    <Flex w='full' h={{ base: '50vh', md: '130vh' }}>
      <video autoPlay muted loop id='myVideo'>
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
      >
        <Stack>
          <motion.div animate={{ scale: 1.2 }} transition={{ duration: 0.5 }}>
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
          </motion.div>
        </Stack>
      </VStack>
    </Flex>
  );
}
