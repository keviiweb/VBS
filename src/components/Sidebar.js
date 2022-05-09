import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CloseButton, Flex, Image } from "@chakra-ui/react";
import { FiHome, FiCompass, FiStar, FiSettings } from "react-icons/fi";
import NavLink from "./NavLink";

const LinkItems = [
  { label: "VENUE BOOKING SYSTEM", icon: FiHome, href: "/vbs" },
  { label: "CCA ATTENDANCE", icon: FiSettings, href: "/cca" },
  { label: "KEIPs", icon: FiStar, href: "/keips" },
  { label: "CONTACT US", icon: FiCompass, href: "/contact" },
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
        <Image
          boxSize="100px"
          objectFit="contain"
          src="image/keviilogo.png"
          alt="KEVII Logo"
        />
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link, i) => (
        <NavLink key={i} link={link} />
      ))}
    </Box>
  );
}
