import React, { useCallback, useMemo } from 'react';
import { Box, Button, Flex, Image, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

/**
 * Returns a card containing an image, title, description and a link if the card is clickable
 *
 * Two types of card is available:
 * 1. Card with a button that contains a link
 * 2. Card that is clickable throughout
 *
 * @param param0 Information about the particular item
 * @returns A card
 */
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
      <Box
        mx='auto'
        borderColor='#888888'
        border='thin'
        rounded='xl'
        shadow='2xl'
        maxW='2xl'
        _hover={{ md: hoverStyles }}
      >
        {img !== null && img !== undefined && (
          <Image
            borderRadius='xl'
            w='full'
            fit='cover'
            src={img}
            alt='Event'
            loading='eager'
          />
        )}
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

          {buttonLink !== undefined &&
            buttonLink !== null &&
            buttonText !== undefined &&
            buttonText !== null && (
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
      <NextLink href={link !== undefined && link !== null ? link : ''} passHref>
        <Box
          display='block'
          mt={2}
          _hover={{ color: 'gray.600', textDecor: 'none' }}
        >
          <Box
            mx='auto'
            borderColor='#888888'
            border='thin'
            rounded='xl'
            shadow='2xl'
            maxW='2xl'
            _hover={{ md: hoverStyles }}
          >
            {img !== null && img !== undefined && (
              <Image
                borderRadius='xl'
                w='full'
                fit='cover'
                src={img}
                alt='Event'
              />
            )}
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
      {buttonLink !== undefined &&
      buttonLink !== null &&
      buttonText !== undefined &&
      buttonText !== null ? (
        <SubCardWButton />
      ) : (
        <SubCard />
      )}
    </Flex>
  );
}
