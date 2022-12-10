import React from 'react';
import NextLink from 'next/link';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { checkerString } from '@constants/sys/helper';

/**
 * Renders a clickable link with icon for the Sidebar
 *
 * @param param0 Parameters
 * @returns A navigation link
 */
export default function NavLink({ link, ...rest }) {
  const { label, icon, href } = link;

  return (
    <Box>
      {checkerString(href) && (
        <NextLink href={href} passHref>
          <Flex
            align='center'
            p='4'
            mx='4'
            borderRadius='lg'
            role='group'
            cursor='pointer'
            _hover={{
              bg: 'cyan.400',
              color: 'white',
            }}
            {...rest}
          >
            {icon !== null && icon !== undefined && (
              <Icon
                mr='4'
                fontSize='16'
                _groupHover={{
                  color: 'white',
                }}
                as={icon}
              />
            )}
            <Text fontSize='0.9rem'>{label}</Text>
          </Flex>
        </NextLink>
      )}
    </Box>
  );
}
