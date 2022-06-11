import { chakra, Box, Flex, Link, Icon, HStack } from '@chakra-ui/react';

import { AiFillFacebook, AiFillInstagram, AiFillYoutube } from 'react-icons/ai';
import React from 'react';

export default function Social() {
  return (
    <Flex
      bg='#F9FAFB'
      p={20}
      w='auto'
      justifyContent='center'
      alignItems='center'
    >
      <Box py={12} rounded='xl'>
        <Box maxW='7xl' px={{ base: 4, lg: 8 }}>
          <Box>
            <chakra.p
              mt={2}
              fontSize={{ base: 'lg', sm: 'lg', lg: 'lg' }}
              lineHeight='8'
              letterSpacing='tight'
              color='gray.900'
            >
              Follow us on Social Media!
            </chakra.p>
          </Box>

          <Box alignItems='center'>
            <HStack spacing={10} textAlign='center'>
              <Link
                isExternal
                aria-label='Facebook Page'
                href='https://www.facebook.com/keviihall'
              >
                <Icon
                  as={AiFillFacebook}
                  display='block'
                  transition='color 0.2s'
                  w='10'
                  h='10'
                  _hover={{ color: 'gray.600' }}
                />
              </Link>
              <Link
                isExternal
                aria-label='Instagram Page'
                href='https://www.instagram.com/kingedwardviihall/'
              >
                <Icon
                  as={AiFillInstagram}
                  display='block'
                  transition='color 0.2s'
                  w='10'
                  h='10'
                  _hover={{ color: 'gray.600' }}
                />
              </Link>
              <Link
                isExternal
                aria-label='Youtube Page'
                href='https://www.youtube.com/user/KEMediaX'
              >
                <Icon
                  as={AiFillYoutube}
                  display='block'
                  transition='color 0.2s'
                  w='10'
                  h='10'
                  _hover={{ color: 'gray.600' }}
                />
              </Link>
            </HStack>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
