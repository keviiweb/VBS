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
import NavLink from "@components/sys/vbs/NavLink";
import Link from "next/link";
import { currentSession } from "@helper/sys/session";
import { useEffect } from "react";

let LinkItems = [
  { label: "VENUE BOOKING SYSTEM", icon: FiHome, href: "/sys/vbs" },
  { label: "CCA ATTENDANCE", icon: FiSettings, href: "/sys/cca" },
  { label: "KEIPs", icon: FiStar, href: "/sys/keips" },
  { label: "CONTACT US", icon: FiCompass, href: "/sys/contact" },
  {
    label: "MANAGE BOOKINGS",
    icon: FiCalendar,
    href: "/sys/manage/bookings",
  },
];

const adminMenu = [
  { label: "VENUE BOOKING SYSTEM", icon: FiHome, href: "/sys/vbs" },
  { label: "CCA ATTENDANCE", icon: FiSettings, href: "/sys/cca" },
  { label: "KEIPs", icon: FiStar, href: "/sys/keips" },
  { label: "CONTACT US", icon: FiCompass, href: "/sys/contact" },
  {
    label: "MANAGE BOOKINGS",
    icon: FiCalendar,
    href: "/sys/manage/admin/bookings",
  },
  {
    label: "MANAGE VENUES",
    icon: FiMapPin,
    href: "/sys/manage/admin/venues",
  },
];

const userMenu = [
  { label: "VENUE BOOKING SYSTEM", icon: FiHome, href: "/sys/vbs" },
  { label: "CCA ATTENDANCE", icon: FiSettings, href: "/sys/cca" },
  { label: "KEIPs", icon: FiStar, href: "/sys/keips" },
  { label: "CONTACT US", icon: FiCompass, href: "/sys/contact" },
  {
    label: "MANAGE BOOKINGS",
    icon: FiCalendar,
    href: "/sys/manage/bookings",
  },
];

export default function Sidebar({ onClose, ...rest }) {
  const router = useRouter();
  useEffect(() => {
    async function fetchData() {
      const session = await currentSession();
      if (session) {
        if (session.user.admin) {
          LinkItems = adminMenu;
        } else {
          LinkItems = userMenu;
        }
      }
    }
    fetchData();

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
        <Link href="/sys">
          <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            KEVII VBS
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
