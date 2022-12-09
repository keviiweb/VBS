import React from 'react';
import { Box, Heading, Image } from '@chakra-ui/react';

import { checkerString } from '@constants/sys/helper';

/**
 * Renders a card that shows the image of the announcement.
 *
 * Used for displaying announcements
 *
 * @param param0 Product
 * @returns A card
 */
export default function AnnouncementCard ({ product }) {
  const { image, description } = product;

  return (
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
        maxW='xl'
      >
        {checkerString(image) && (
          <Image
            borderRadius='xl'
            w='full'
            fit='cover'
            src={image}
            alt={description}
          />
        )}
        {checkerString(description) && (
          <Box p={2}>
            <Box>
              <Heading
                style={{ whiteSpace: 'pre-line' }}
                mt={2}
                fontSize='xl'
                color='gray.600'
              >
                {description}
              </Heading>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
