import React from 'react';
import Image from 'next/image';
import { Box, Flex } from '@chakra-ui/react';

import { checkerString } from '@constants/sys/helper';

/**
 * Renders a card that is displayed in the main page of VBS
 *
 * @param param0 CCA information as well as callback function
 * @returns A card displaying the CCA image and name
 */
export default function CCACard ({ product, setModalData }) {
  const image: string = checkerString(product.image)
    ? product.image
    : '/sys/image/placeholder.png';
  const name: string = checkerString(product.ccaName) ? product.ccaName : 'CCA';

  return (
    <Flex
      w={{ base: 'full', md: '500px', lg: '500px' }}
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
      <Box id='flex-box' key='flex-box' w='full' h='full'>
        <Box
          id='flex-image-box'
          key='flex-image-box'
          w='100%'
          height='200px'
          position='relative'
          overflow='hidden'
          roundedTop='lg'
        >
          <Image
            src={image}
            priority
            alt='picture of a cca'
            fill
            sizes='100vw'
            style={{
              objectFit: 'cover'
            }}
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
