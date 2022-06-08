import React, { useState } from 'react';
import { Text, Box, Flex, Image, HStack, Stack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { layoutVariant } from '@root/motion';

export default function Carousel() {
  const arrowStyles = {
    cursor: 'pointer',
    pos: 'absolute',
    top: '50%',
    w: 'auto',
    mt: '-22px',
    p: '16px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
    transition: '0.6s ease',
    borderRadius: '0 3px 3px 0',
    userSelect: 'none',
    _hover: {
      opacity: 0.8,
      bg: 'black',
    },
  };

  const slides = [
    {
      img: '/landing/carousel/dining-hall.png',
      description: 'Dining Hall',
    },
    {
      img: '/landing/carousel/gym-2.png',
      description: 'Gym',
    },
    {
      img: '/landing/carousel/learning-and-media-room.png',
      description: 'Learning and Media Room',
    },
    {
      img: '/landing/carousel/single-room.png',
      description: 'Single Room',
    },
    {
      img: '/landing/carousel/tennis-court.png',
      description: 'Tennis Court',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const slidesCount = slides.length;

  const prevSlide = () => {
    setCurrentSlide((s) => (s === 0 ? slidesCount - 1 : s - 1));
  };
  const nextSlide = () => {
    setCurrentSlide((s) => (s === slidesCount - 1 ? 0 : s + 1));
  };
  const setSlide = (slide) => {
    setCurrentSlide(slide);
  };

  const carouselStyle = {
    transition: 'all .5s',
    ml: `-${currentSlide * 100}%`,
  };

  return (
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
                fontSize={{ base: '2xl', sm: '3xl', lg: '4xl' }}
                lineHeight='8'
                fontWeight='extrabold'
                letterSpacing='tight'
                color='gray.900'
              >
                A LOOK INTO THE KEVIIAN ABODE
              </Text>
            </Box>

            <Flex w='800px' pos='relative' overflow='hidden'>
              <Flex h='400px' w='full' {...carouselStyle}>
                {slides.map((slide, sid) => (
                  <Box
                    key={`slide-${sid}`}
                    boxSize='full'
                    shadow='md'
                    flex='none'
                  >
                    <Text
                      color='white'
                      fontSize='xs'
                      p='8px 12px'
                      pos='absolute'
                      top='0'
                    >
                      {sid + 1} /{slidesCount}
                    </Text>
                    <Image
                      src={slide.img}
                      alt='carousel image'
                      boxSize='full'
                      backgroundSize='cover'
                    />
                    <Stack
                      p='8px 12px'
                      pos='absolute'
                      bottom='1px'
                      textAlign='center'
                      w='full'
                      mb='5'
                      color='white'
                    >
                      <Text fontSize='lg'>{slide.description}</Text>
                    </Stack>
                  </Box>
                ))}
              </Flex>
              <Text {...arrowStyles} left='0' onClick={prevSlide}>
                &#10094;
              </Text>
              <Text {...arrowStyles} right='0' onClick={nextSlide}>
                &#10095;
              </Text>
              <HStack justify='center' pos='absolute' bottom='8px' w='full'>
                {Array.from({ length: slidesCount }).map((_, slide) => (
                  <Box
                    key={`dots-${slide}`}
                    cursor='pointer'
                    boxSize={['7px', '0px', '15px']}
                    m='0 2px'
                    bg={
                      currentSlide === slide
                        ? 'blackAlpha.800'
                        : 'blackAlpha.500'
                    }
                    rounded='50%'
                    display='inline-block'
                    transition='background-color 0.6s ease'
                    _hover={{ bg: 'blackAlpha.800' }}
                    onClick={() => setSlide(slide)}
                  />
                ))}
              </HStack>
            </Flex>
          </Stack>
        </Flex>
      </motion.div>
    </motion.div>
  );
}
