import React from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';

import Auth from '@components/sys/Auth';

/**
 * Returns a contact page that basically just has KEWEB's email.
 *
 * @returns Contact Page
 */
export default function Contact () {
  return (
    <Auth admin={undefined}>
      <Flex bg='gray.100' align='center' justify='center' id='contact'>
        <Box
          borderRadius='lg'
          m={{ base: 5, md: 16, lg: 10 }}
          p={{ base: 5, lg: 16 }}
        >
          <Box>
            <VStack spacing={{ base: 4, md: 8, lg: 20 }}>
              <Box
                bg='white'
                borderRadius='lg'
                p={8}
                color='gray.700'
                shadow='base'
              >
                <VStack spacing={5}>
                  <Text>Please contact </Text>
                  <Text color='blue'>
                    <a href='mailto:ke7webdev@gmail.com'>ke7webdev@gmail.com</a>
                  </Text>
                  <Text>for any queries.</Text>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </Auth>
  );
}
