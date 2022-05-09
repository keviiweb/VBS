import NextLink from "next/link";
import { Flex, Icon, Text } from "@chakra-ui/react";

export default function NavLink({ link, ...rest }) {
  const { label, icon, href, isDivider } = link;

  return (
    <NextLink href={href} passHref>
      <a>
        {isDivider && (<Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16" 
              as={icon}
            />
          )}
          <Text fontSize="1.2rem">{label}</Text>
        </Flex>)}
        {!isDivider && (<Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: "cyan.400",
            color: "white",
          }}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: "white",
              }}
              as={icon}
            />
          )}
          <Text fontSize="1.2rem">{label}</Text>
        </Flex>)}
      </a>
    </NextLink>
  );
}
