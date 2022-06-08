import React, { useCallback } from 'react';

import {
  chakra,
  Box,
  Flex,
  HStack,
  Button,
  useDisclosure,
  VStack,
  IconButton,
  CloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { AiOutlineMenu } from 'react-icons/ai';
import Image from 'next/image';
import NextLink from 'next/link';

export default function Header() {
  const bg = 'black';
  const mobileNav = useDisclosure();

  const Section = useCallback((props) => {
    const ic = 'gray.600';
    const hbg = 'gray.50';
    const tcl = 'gray.900';
    const dcl = 'gray.500';
    return (
      <Box>
        {props.link && (
          <NextLink passHref href={props.link}>
            <Box
              m={-3}
              p={3}
              display='flex'
              alignItems='start'
              rounded='lg'
              _hover={{ bg: hbg }}
            >
              {props.icon && (
                <Icon
                  flexShrink={0}
                  h={6}
                  w={6}
                  mt={2}
                  color={ic}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                >
                  <path d={props.icon} />
                </Icon>
              )}

              <Box ml={4}>
                <chakra.p fontSize='sm' fontWeight='700' color={tcl}>
                  {props.title}
                </chakra.p>
                <chakra.p mt={1} fontSize='sm' color={dcl}>
                  {props.children}
                </chakra.p>
              </Box>
            </Box>
          </NextLink>
        )}
      </Box>
    );
  }, []);

  const CCA = useCallback((props) => {
    const sections = [
      {
        title: 'Sports',
        icon: null,
        description: 'Learn a new sport!',
        link: '/sports',
      },
      {
        title: 'Cultural',
        icon: null,
        description: 'Showcase your inner talents!',
        link: '/cultural',
      },
      {
        title: 'Production',
        icon: null,
        description: 'Be part of a large family!',
        link: '/production',
      },
      {
        title: 'Committee',
        icon: null,
        description: 'Take charge and be your own leader!',
        link: '/committee',
      },
    ];

    return (
      <SimpleGrid
        columns={props.h ? { base: 1, md: 3, lg: 5 } : 1}
        pos='relative'
        gap={{ base: 6, sm: 8 }}
        px={5}
        py={6}
        p={{ sm: 8 }}
      >
        {sections.map(({ title, icon, description, link }, sid) => (
          <Section title={title} icon={icon} key={sid} link={link}>
            {description}
          </Section>
        ))}
      </SimpleGrid>
    );
  }, []);

  const System = useCallback((props) => {
    const system = [
      {
        title: 'VBS',
        icon: null,
        description: 'Venue Booking System for KEVII',
        link: '/sys',
      },
    ];

    return (
      <SimpleGrid
        columns={props.h ? { base: 1, md: 3, lg: 5 } : 1}
        pos='relative'
        gap={{ base: 6, sm: 8 }}
        px={5}
        py={6}
        p={{ sm: 8 }}
      >
        {system.map(({ title, icon, description, link }, sid) => (
          <Section title={title} icon={icon} key={sid} link={link}>
            {description}
          </Section>
        ))}
      </SimpleGrid>
    );
  }, []);

  return (
    <chakra.header id='header' w='full' px={{ base: 2, sm: 4 }} py={6}>
      <Flex alignItems='center' justifyContent='space-between' mx='auto'>
        <NextLink href='/'>
          <Flex mt={3} ml={{ base: 5, md: 8, lg: 12, xl: 20 }}>
            <Image
              src='/sys/image/keviilogo.png'
              width='50px'
              height='80px'
              alt='KEVII Logo'
            />
          </Flex>
        </NextLink>
        <HStack display='flex' alignItems='center' spacing={1}>
          <HStack
            spacing={{ base: 1, lg: 5 }}
            mr={{ base: 2, md: 2, lg: 2, xl: 20 }}
            color='brand.500'
            display={{ base: 'none', md: 'inline-flex' }}
          >
            <Popover>
              <PopoverTrigger>
                <Button variant='ghost'>CCA</Button>
              </PopoverTrigger>
              <PopoverContent w='100vw' maxW='md' _focus={{ boxShadow: 'md' }}>
                <CCA />
              </PopoverContent>
            </Popover>

            <NextLink href='/event'>
              <Button variant='ghost'>Events</Button>
            </NextLink>

            <NextLink href='/community'>
              <Button variant='ghost'>Community</Button>
            </NextLink>

            <NextLink href='/contact'>
              <Button variant='ghost'>Contact</Button>
            </NextLink>

            <Popover>
              <PopoverTrigger>
                <Button variant='ghost'>Current Residents</Button>
              </PopoverTrigger>
              <PopoverContent w='100vw' maxW='md' _focus={{ boxShadow: 'md' }}>
                <System />
              </PopoverContent>
            </Popover>
          </HStack>

          <Box display={{ base: 'inline-flex', md: 'none' }}>
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label='Open menu'
              fontSize='20px'
              color='gray.800'
              variant='ghost'
              icon={<AiOutlineMenu />}
              onClick={mobileNav.onOpen}
            />

            <VStack
              pos='absolute'
              top={0}
              left={0}
              right={0}
              display={mobileNav.isOpen ? 'flex' : 'none'}
              flexDirection='column'
              p={2}
              pb={4}
              m={2}
              bg={bg}
              spacing={3}
              rounded='sm'
              shadow='sm'
              zIndex={2}
            >
              <CloseButton
                aria-label='Close menu'
                onClick={mobileNav.onClose}
              />

              <NextLink href='/event'>
                <Button variant='ghost'>Events</Button>
              </NextLink>

              <NextLink href='/community'>
                <Button variant='ghost'>Community</Button>
              </NextLink>

              <NextLink href='/contact'>
                <Button variant='ghost'>Contact</Button>
              </NextLink>

              <Popover>
                <PopoverTrigger>
                  <Button variant='ghost'>Current Residents</Button>
                </PopoverTrigger>
                <PopoverContent
                  w='100vw'
                  maxW='md'
                  _focus={{ boxShadow: 'md' }}
                >
                  <System />
                </PopoverContent>
              </Popover>
            </VStack>
          </Box>
        </HStack>
      </Flex>
    </chakra.header>
  );
}
