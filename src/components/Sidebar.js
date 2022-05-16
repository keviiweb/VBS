import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Box, CloseButton, Flex, Text } from "@chakra-ui/react";
import {
  FiHome,
  FiCompass,
  FiStar,
  FiSettings,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import NavLink from "./NavLink";
import Link from "next/link";
import { currentSession } from "@constants/helper";

let LinkItems = [
  { label: "VENUE BOOKING SYSTEM", icon: FiHome, href: "/vbs" },
  { label: "CCA ATTENDANCE", icon: FiSettings, href: "/cca" },
  { label: "KEIPs", icon: FiStar, href: "/keips" },
  { label: "CONTACT US", icon: FiCompass, href: "/contact" },
  {
    label: "MANAGE BOOKINGS",
    icon: FiCalendar,
    href: "/manage/bookings",
  },
];

export default function Sidebar({ onClose, ...rest }) {
  const router = useRouter();
  const session = currentSession();

  useEffect(() => {
    if (session.user.admin) {
      LinkItems = [
        { label: "VENUE BOOKING SYSTEM", icon: FiHome, href: "/vbs" },
        { label: "CCA ATTENDANCE", icon: FiSettings, href: "/cca" },
        { label: "KEIPs", icon: FiStar, href: "/keips" },
        { label: "CONTACT US", icon: FiCompass, href: "/contact" },
        {
          label: "MANAGE BOOKINGS",
          icon: FiCalendar,
          href: "/manage/admin/bookings",
        },
        {
          label: "MANAGE VENUES",
          icon: FiMapPin,
          href: "/manage/admin/venues",
        },
      ];
    }

    router.events.on("routeChangeComplete", onClose);
    return () => {
      router.events.off("routeChangeComplete", onClose);
    };
  }, [router.events, onClose, session]);

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
        <Link href="/">
          <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            KEVII
          </Text>
        </Link>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link, i) => (
        <NavLink key={i} link={link} />
      ))}
    </Box>
  );
}
