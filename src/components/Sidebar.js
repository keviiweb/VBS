import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CloseButton, Flex, Text } from "@chakra-ui/react";

import {
  FiHome,
  FiCompass,
  FiStar,
  FiSettings,
} from "react-icons/fi";

import NavLink from "./NavLink";

const LinkItems = [
  { label: "SERVICES", isDivider: true },
  { label: "VENUE BOOKING SYSTEM", icon: FiHome, href: "/", isDivider: false },
  { label: "CCA ATTENDANCE", icon: FiSettings, href: "/", isDivider: false },
  { label: "KEIPs", icon: FiStar, href: "/" , isDivider: false},
  { label: "CONTACT US", icon: FiCompass, href: "/", isDivider: false },
];

export default function Sidebar({ onClose, ...rest }) {
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeComplete", onClose);
    return () => {
      router.events.off("routeChangeComplete", onClose);
    };
  }, [router.events, onClose]);

  return (
    <Box
      transition="3s ease"
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Logo
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link, i, isDivider) => (
        <NavLink key={i} link={link} isDivider={isDivider} />
      ))}
    </Box>
  );
}
