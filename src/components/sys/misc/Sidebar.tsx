import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, CloseButton, Flex, Text } from '@chakra-ui/react';
import {
  FiHome,
  FiCompass,
  FiStar,
  FiSettings,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiAlertCircle,
} from 'react-icons/fi';

import NavLink from '@components/sys/misc/NavLink';
import { Session } from 'next-auth/core/types';
import { levels } from '@root/src/constants/sys/admin';

const ownerMenu = [
  { label: 'VENUE BOOKING SYSTEM', icon: FiHome, href: '/sys/vbs' },
  { label: 'CCA ATTENDANCE', icon: FiSettings, href: '/sys/cca' },
  { label: 'KEIPS', icon: FiStar, href: '/sys/keips' },
  { label: 'CONTACT US', icon: FiCompass, href: '/sys/contact' },
  {
    label: 'APPROVE BOOKINGS',
    icon: FiCalendar,
    href: '/sys/manage/admin/bookings',
  },
  {
    label: 'MANAGE VENUES',
    icon: FiMapPin,
    href: '/sys/manage/admin/venues',
  },
  {
    label: 'MANAGE BOOKINGS',
    icon: FiCalendar,
    href: '/sys/manage/bookings',
  },
  {
    label: 'MANAGE USERS',
    icon: FiUser,
    href: '/sys/manage/admin/users',
  },
  {
    label: 'MANAGE ANNOUNCEMENTS',
    icon: FiAlertCircle,
    href: '/sys/manage/announcement',
  },
  {
    label: 'MANAGE KEIPS',
    icon: FiStar,
    href: '/sys/manage/admin/keips',
  },
];

const adminMenu = [
  { label: 'VENUE BOOKING SYSTEM', icon: FiHome, href: '/sys/vbs' },
  { label: 'CCA ATTENDANCE', icon: FiSettings, href: '/sys/cca' },
  { label: 'KEIPS', icon: FiStar, href: '/sys/keips' },
  { label: 'CONTACT US', icon: FiCompass, href: '/sys/contact' },
  {
    label: 'APPROVE BOOKINGS',
    icon: FiCalendar,
    href: '/sys/manage/admin/bookings',
  },
  {
    label: 'MANAGE VENUES',
    icon: FiMapPin,
    href: '/sys/manage/admin/venues',
  },
  {
    label: 'MANAGE BOOKINGS',
    icon: FiCalendar,
    href: '/sys/manage/bookings',
  },
  {
    label: 'MANAGE USERS',
    icon: FiUser,
    href: '/sys/manage/admin/users',
  },
  {
    label: 'MANAGE KEIPS',
    icon: FiStar,
    href: '/sys/manage/admin/keips',
  },
];

const userMenu = [
  { label: 'VENUE BOOKING SYSTEM', icon: FiHome, href: '/sys/vbs' },
  { label: 'CCA ATTENDANCE', icon: FiSettings, href: '/sys/cca' },
  { label: 'KEIPS', icon: FiStar, href: '/sys/keips' },
  { label: 'CONTACT US', icon: FiCompass, href: '/sys/contact' },
  {
    label: 'MANAGE BOOKINGS',
    icon: FiCalendar,
    href: '/sys/manage/bookings',
  },
];

/**
 * Renders a sidebar that switches menu depending on the session
 *
 * @param param0 React Children and session
 * @returns Sidebar
 */
export default function Sidebar({ session, onClose, ...rest }) {
  const router = useRouter();
  const [menu, setMenu] = useState(userMenu);

  useEffect(() => {
    function setData(sessionField: Session) {
      if (sessionField.user.admin === levels.ADMIN) {
        setMenu(adminMenu);
      } else if (sessionField.user.admin === levels.OWNER) {
        setMenu(ownerMenu);
      }
    }
    if (session) {
      setData(session);
    }

    if (router.events !== undefined && router.events !== null) {
      router.events.on('routeChangeComplete', onClose);

      return () => {
        router.events.off('routeChangeComplete', onClose);
      };
    }
    return () => {};
  }, [router, onClose, session]);

  return (
    <Box
      transition='3s ease'
      bg='white'
      borderRight='1px'
      borderRightColor='gray.200'
      w={{ base: 'full', md: 60 }}
      pos='fixed'
      h='full'
      {...rest}
    >
      <Flex h='20' alignItems='center' mx='8' justifyContent='space-between'>
        <Link href='/sys'>
          <Text fontSize='2xl' fontFamily='monospace' fontWeight='bold'>
            KEVII
          </Text>
        </Link>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {menu && menu.map((link, i) => <NavLink key={i} link={link} />)}
    </Box>
  );
}
