import React from 'react';
import Image from 'next/image';
import { Box, Flex } from '@chakra-ui/react';

import { checkerString } from '@constants/sys/helper';

/**
 * Renders a card that is displayed in the main page of VBS
 *
 * @param param0 Venue information as well as callback function
 * @returns A card displaying the venue image and name
 */
export default function VenueCard({ product, setModalData }) {
  const image: string = checkerString(product.image)
    ? product.image
    : '/sys/image/placeholder.png';
  const name: string = checkerString(product.name) ? product.name : 'Venue';
  return (
    <Flex
      w='full'
      h='full'
      alignItems='center'
      justifyContent='center'
      cursor='pointer'
      bg='white'
      rounded='xl'
      shadow='lg'
      borderWidth='1px'
      onClick={() => setModalData(product)}
    >
      <Box w='full' h='full'>
        <Box
          w='100%'
          height='200px'
          position='relative'
          overflow='hidden'
          roundedTop='lg'
        >
          <Image
            src={image}
            priority
            objectFit='cover'
            alt='picture of a venue'
            layout='fill'
          />
        </Box>

        <Box p='6'>
          <Box fontWeight='semibold' as='h4' lineHeight='tight'>
            {name}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
