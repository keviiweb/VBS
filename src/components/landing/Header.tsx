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
  PopoverContent,
  SimpleGrid,
  Icon,
  usePopoverContext,
} from '@chakra-ui/react';
import { AiOutlineMenu } from 'react-icons/ai';
import Image from 'next/image';
import NextLink from 'next/link';

import { PopoverTriggerProps } from 'types/popover';

const PopoverTriggerNew: React.FC<
  React.PropsWithChildren<PopoverTriggerProps>
> = (props) => {
  // enforce a single child
  const child: any = React.Children.only(props.children);
  const { getTriggerProps } = usePopoverContext();
  return React.cloneElement(child, getTriggerProps(child.props, child.ref));
};

/**
 * Renders the Header component that contains links to different sections of the page, as well as bring users to the internal VBS system
 *
 * @returns A Header
 */
export default function Header() {
  const bg = 'white';
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

  const CCA = useCallback(() => {
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
        columns={1}
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
  }, [Section]);

  const System = useCallback(() => {
    const system = [
      {
        title: 'VBS',
        icon: null,
        description: 'Venue Booking System for KEVII',
        link: '/sys',
      },
      {
        title: 'KEIPS',
        icon: null,
        description: 'Check your KEIPS',
        link: '/sys/keips',
      },
    ];

    return (
      <SimpleGrid
        columns={1}
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
  }, [Section]);

  return (
    <chakra.header id='header' w='full' px={{ base: 2, sm: 4 }} py={6}>
      <Flex alignItems='center' justifyContent='space-between' mx='auto'>
        <NextLink href='/'>
          <Flex mt={3} mb={3} ml={{ base: 5, md: 8, lg: 12, xl: 20 }}>
            <Image
              src='/sys/image/keviilogo.png'
              width='50'
              height='80'
              alt='KEVII Logo'
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
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
              <PopoverTriggerNew>
                <Button
                  variant='ghost'
                  bg='brand.500'
                  _hover={{ bg: 'brand.500' }}
                  _active={{
                    transform: 'scale(0.92)',
                  }}
                  _focus={{
                    boxShadow: '0 0',
                  }}
                >
                  CCA
                </Button>
              </PopoverTriggerNew>
              <PopoverContent w='100vw' maxW='md' _focus={{ boxShadow: 'md' }}>
                <CCA />
              </PopoverContent>
            </Popover>

            <NextLink href='/event'>
              <Button
                variant='ghost'
                bg='brand.500'
                _hover={{ bg: 'brand.500' }}
                _active={{
                  transform: 'scale(0.92)',
                }}
                _focus={{
                  boxShadow: '0 0',
                }}
              >
                Events
              </Button>
            </NextLink>

            <NextLink href='/community'>
              <Button
                variant='ghost'
                bg='brand.500'
                _hover={{ bg: 'brand.500' }}
                _active={{
                  transform: 'scale(0.92)',
                }}
                _focus={{
                  boxShadow: '0 0',
                }}
              >
                Community
              </Button>
            </NextLink>

            <NextLink href='/contact'>
              <Button
                variant='ghost'
                bg='brand.500'
                _hover={{ bg: 'brand.500' }}
                _active={{
                  transform: 'scale(0.92)',
                }}
                _focus={{
                  boxShadow: '0 0',
                }}
              >
                Contact
              </Button>
            </NextLink>

            <Popover>
              <PopoverTriggerNew>
                <Button
                  variant='ghost'
                  bg='brand.500'
                  _hover={{ bg: 'brand.500' }}
                  _active={{
                    transform: 'scale(0.92)',
                  }}
                  _focus={{
                    boxShadow: '0 0',
                  }}
                >
                  Current Residents
                </Button>
              </PopoverTriggerNew>
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

              <Popover>
                <PopoverTriggerNew>
                  <Button
                    variant='ghost'
                    bg='brand.500'
                    _hover={{ bg: 'brand.500' }}
                    _active={{
                      transform: 'scale(0.92)',
                    }}
                    _focus={{
                      boxShadow: '0 0',
                    }}
                  >
                    CCA
                  </Button>
                </PopoverTriggerNew>
                <PopoverContent
                  w='100vw'
                  maxW='md'
                  _focus={{ boxShadow: 'md' }}
                >
                  <CCA />
                </PopoverContent>
              </Popover>

              <NextLink href='/event'>
                <Button
                  variant='ghost'
                  bg='brand.500'
                  _hover={{ bg: 'brand.500' }}
                  _active={{
                    transform: 'scale(0.92)',
                  }}
                  _focus={{
                    boxShadow: '0 0',
                  }}
                >
                  Events
                </Button>
              </NextLink>

              <NextLink href='/community'>
                <Button
                  variant='ghost'
                  bg='brand.500'
                  _hover={{ bg: 'brand.500' }}
                  _active={{
                    transform: 'scale(0.92)',
                  }}
                  _focus={{
                    boxShadow: '0 0',
                  }}
                >
                  Community
                </Button>
              </NextLink>

              <NextLink href='/contact'>
                <Button
                  variant='ghost'
                  bg='brand.500'
                  _hover={{ bg: 'brand.500' }}
                  _active={{
                    transform: 'scale(0.92)',
                  }}
                  _focus={{
                    boxShadow: '0 0',
                  }}
                >
                  Contact
                </Button>
              </NextLink>

              <Popover>
                <PopoverTriggerNew>
                  <Button
                    variant='ghost'
                    bg='brand.500'
                    _hover={{ bg: 'brand.500' }}
                    _active={{
                      transform: 'scale(0.92)',
                    }}
                    _focus={{
                      boxShadow: '0 0',
                    }}
                  >
                    Current Residents
                  </Button>
                </PopoverTriggerNew>
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
