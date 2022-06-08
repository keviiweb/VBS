import React, { useCallback, useMemo } from 'react';
import { Box, Button, Flex, Image, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Card({
  title,
  description,
  img,
  buttonText,
  buttonLink,
  link,
}) {
  const hoverStyles = useMemo(
    () => ({
      boxShadow: '1px 1px #888888',
      transform: 'translate3d(0px, 4px, 2px)',
    }),
    [],
  );

  const SubCardWButton = useCallback(
    () => (
      <Box mx='auto' rounded='lg' shadow='lg' maxW='2xl' _hover={hoverStyles}>
        {img && <Image w='full' fit='cover' src={img} alt='Event' loading='eager' />}
        <Box p={6}>
          <Box>
            <Text fontWeight='bold' fontSize='2xl'>
              {title}
            </Text>

            <Text
              style={{ whiteSpace: 'pre-line' }}
              mt={2}
              fontSize='sm'
              color='gray.600'
            >
              {description}
            </Text>
          </Box>

          {buttonLink && buttonText && (
            <Link isExternal href={buttonLink}>
              <Button mt={10}>{buttonText}</Button>
            </Link>
          )}
        </Box>
      </Box>
    ),
    [img, title, description, buttonLink, buttonText, hoverStyles],
  );

  const SubCard = useCallback(
    () => (
      <NextLink href={link || ''} passHref>
        <Box
          display='block'
          href=''
          mt={2}
          _hover={{ color: 'gray.600', textDecor: 'none' }}
        >
          <Box
            mx='auto'
            rounded='lg'
            shadow='lg'
            maxW='2xl'
            _hover={hoverStyles}
          >
            {img && <Image w='full' fit='cover' src={img} alt='Event' />}
            <Box p={6}>
              <Box>
                <Text fontWeight='bold' fontSize='2xl'>
                  {title}
                </Text>

                <Text
                  style={{ whiteSpace: 'pre-line' }}
                  mt={2}
                  fontSize='sm'
                  color='gray.600'
                >
                  {description}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </NextLink>
    ),
    [link, img, title, description, hoverStyles],
  );

  return (
    <Flex p={50} w='full' alignItems='center' justifyContent='center'>
      {buttonLink && buttonText ? <SubCardWButton /> : <SubCard />}
    </Flex>
  );
}
