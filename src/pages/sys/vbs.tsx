import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';
import {
  Box,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  SimpleGrid,
  Stack,
  Select,
  Text,
  useToast,
} from '@chakra-ui/react';

import Auth from '@components/sys/Auth';
import VenueCard from '@components/sys/vbs/VenueCard';
import VenueBookingModal from '@components/sys/vbs/VenueBookingModal';
import Loading from '@components/sys/misc/Loading';
import BookingCalendar from '@components/sys/vbs/BookingCalendar';
import LoadingModal from '@components/sys/misc/LoadingModal';
import BookingModal from '@components/sys/vbs/BookingModal';

import { fetchVenue } from '@helper/sys/vbs/venue';
import { currentSession } from '@helper/sys/sessionServer';

import { checkerString } from '@constants/sys/helper';
import { levels } from '@constants/sys/admin';

import safeJsonStringify from 'safe-json-stringify';
import { GetServerSideProps } from 'next';

import { Result } from 'types/api';
import { Venue } from 'types/vbs/venue';
import { Session } from 'next-auth/core/types';
import { Booking } from 'types/vbs/booking';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

interface CalendarData {
  id: string | undefined;
  title: string | undefined;
  start: string | undefined;
  end: string | undefined;
  extendedProps: {
    description: string;
    booking: Booking;
  };
}

/**
 * Main entry point for VBS
 *
 * Users can create venue booking requests through here
 *
 * @param props List of venues
 * @returns VBS Page
 */
export default function VBS(props: any) {
  const toast = useToast();

  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [cards, setCards] = useState<JSX.Element[]>([]);
  const minDate = useRef(3);
  const maxDate = useRef(30);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<JSX.Element[]>([]);

  // Calendar stuff
  const venueData = useRef<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [venueDropdown, setVenueDropdown] = useState<JSX.Element[]>([]);
  const [venueID, setVenueID] = useState('');
  const [events, setEvents] = useState<CalendarData[]>([]);
  const [startTime, setStartTime] = useState('08:00:00');
  const [endTime, setEndTime] = useState('23:00:00');
  const [modalBookingData, setModalBookingData] = useState<Booking | null>(
    null,
  );
  const venueIDDB = useRef('');

  const [level, setLevel] = useState(levels.USER);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const generateVenueDropdown = useCallback(async (content: Venue[]) => {
    const selection: JSX.Element[] = [];
    venueData.current = [];

    selection.push(<option key='' value='' aria-label='Default' />);

    for (let key = 0; key < content.length; key += 1) {
      if (content[key]) {
        const dataField: Venue = content[key];
        selection.push(
          <option key={dataField.id} value={dataField.id}>
            {dataField.name}
          </option>,
        );

        venueData.current.push(dataField);
      }
    }

    setVenueDropdown(selection);
  }, []);

  const populateCalendar = useCallback(async (content: Booking[]) => {
    const event: CalendarData[] = [];
    let count = 0;

    for (let key = 0; key < content.length; key += 1) {
      if (content[key]) {
        const dataField: Booking = content[key];

        const description = `CCA: ${dataField.cca} EMAIL: ${dataField.email}`;

        const e = {
          id: dataField.id,
          title: dataField.title,
          start: dataField.start,
          end: dataField.end,
          extendedProps: {
            description: description,
            booking: dataField,
          },
        };

        event.push(e);

        if (count === 0) {
          const start = dataField.startHour;
          const end = dataField.endHour;

          if (start !== undefined && end !== undefined) {
            setStartTime(start);
            setEndTime(end);
            count += 1;
          }
        }
      }
    }

    setEvents(event);
  }, []);

  const fetchBookings = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/booking/fetch', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: id,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            await populateCalendar(content.msg);
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
      }
    },
    [populateCalendar],
  );

  const onVenueIDChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;

      for (let key = 0; key < venueData.current.length; key += 1) {
        if (venueData.current[key]) {
          const ven: Venue = venueData.current[key];
          if (ven.id === value) {
            await fetchBookings(value);
            venueIDDB.current = value;
            setVenueID(value);
            setSelectedVenue(ven.name);
            break;
          }
        }
      }
    }
  };

  const handleEventClick = (info: {
    event: {
      extendedProps: {
        booking: Booking;
        description: string;
      };
      title: string;
    };
  }) => {
    if (info.event.extendedProps.description) {
      const bookings: Booking = info.event.extendedProps.booking;
      setModalBookingData(bookings);
    }
  };

  const handleMouseEnter = (info: {
    event: { extendedProps: { description: string }; title: string };
  }) => {
    if (info.event.extendedProps.description) {
      toast({
        title: info.event.title,
        description: info.event.extendedProps.description,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleMouseLeave = () => {
    toast.closeAll();
  };

  useEffect(() => {
    async function fetchData(propsField: any) {
      setIsLoading(true);

      setLevel(propsField.level);

      minDate.current = propsField.minDate
        ? propsField.minDate
        : minDate.current;
      maxDate.current = propsField.maxDate
        ? propsField.maxDate
        : maxDate.current;

      if (propsField.data) {
        const res: Result = propsField.data;
        if (res.msg.length > 0) {
          if (res.status) {
            const result: Venue[] = res.msg;
            if (result !== [] && result !== null && result !== undefined) {
              const cardRes: JSX.Element[] = [];
              result.forEach((item) => {
                if (item.visible) {
                  cardRes.push(
                    <MotionBox id={item.name} key={item.id}>
                      <VenueCard product={item} setModalData={setModalData} />
                    </MotionBox>,
                  );
                }
              });
              setCards(cardRes);
              await generateVenueDropdown(result);
            }

            venueData.current = result;
            setIsLoading(false);
          }
        }
      }
    }
    fetchData(props);
  }, [props, generateVenueDropdown]);

  const handleSearch = (event: { target: { value: string } }) => {
    if (event.target.value !== null && event.target.value !== undefined) {
      const searchInput: string = event.target.value;
      setSearch(searchInput);

      if (checkerString(searchInput)) {
        const filteredDataField = cards.filter((value) =>
          value.props.id.toLowerCase().includes(searchInput.toLowerCase()),
        );

        setFilteredData(filteredDataField);
      } else {
        setFilteredData([]);
      }
    } else {
      setFilteredData([]);
    }
  };

  return (
    <>
      {isLoading && (
        <Box>
          <Loading message='Loading venues...' />
        </Box>
      )}
      {!isLoading && (
        <Auth admin={undefined}>
          <Box>
            <LoadingModal
              isOpen={!!submitButtonPressed}
              onClose={() => setSubmitButtonPressed(false)}
            />

            <Box
              bg='white'
              borderRadius='lg'
              width={{ base: 'full', md: 'full', lg: 'full' }}
              p={8}
              color='gray.700'
              shadow='base'
              key='booking-calendar'
              mb={5}
            >
              <Stack direction='row'>
                <Heading size='sm' mb={4}>
                  Booking Calendar
                </Heading>
              </Stack>
              {selectedVenue && <Text>Selected Venue: {selectedVenue}</Text>}

              {venueDropdown && (
                <Stack spacing={2} w='full' mb='10'>
                  <FormLabel>Select Venue</FormLabel>
                  <Select value={venueID} onChange={onVenueIDChange} size='sm'>
                    {venueDropdown}
                  </Select>
                </Stack>
              )}

              {venueDropdown && selectedVenue && (
                <BookingCalendar
                  slotMax={endTime}
                  slotMin={startTime}
                  events={events}
                  eventClick={handleEventClick}
                  eventMouseEnter={handleMouseEnter}
                  eventMouseLeave={handleMouseLeave}
                />
              )}

              {(level === levels.ADMIN || level === levels.OWNER) && (
                <BookingModal
                  isBookingRequest={false}
                  isOpen={!!modalBookingData}
                  onClose={() => setModalBookingData(null)}
                  modalData={modalBookingData}
                  isAdmin
                />
              )}

              {level === levels.USER && (
                <BookingModal
                  isBookingRequest={false}
                  isOpen={!!modalBookingData}
                  onClose={() => setModalBookingData(null)}
                  modalData={modalBookingData}
                  isAdmin={false}
                />
              )}
            </Box>

            <Box
              bg='white'
              borderRadius='lg'
              width={{ base: 'full', md: 'full', lg: 'full' }}
              color='gray.700'
              shadow='base'
            >
              <InputGroup>
                <InputLeftAddon>Search Venues:</InputLeftAddon>
                <Input
                  type='text'
                  placeholder=''
                  value={search}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Box>
            <MotionSimpleGrid
              mt='3'
              minChildWidth={{ base: 'full', md: '30vh', lg: '50vh' }}
              spacing='2em'
              minH='full'
              variants={parentVariant}
              initial='initial'
              animate='animate'
            >
              {filteredData && filteredData.length ? filteredData : cards}
            </MotionSimpleGrid>
            <VenueBookingModal
              isOpen={!!modalData}
              onClose={() => setModalData(null)}
              modalData={modalData}
              calendarMin={minDate.current}
              calendarMax={maxDate.current}
            />
          </Box>
        </Auth>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (cont) => {
  cont.res.setHeader(
    'Cache-Control',
    'public, s-maxage=240, stale-while-revalidate=480',
  );

  let data: Result | null = null;
  let level: number = levels.USER;

  try {
    const session: Session | null = await currentSession(null, null, cont);
    if (session !== null) {
      level = session.user.admin;
      const res: Result = await fetchVenue(session);
      const stringifiedData = safeJsonStringify(res);
      data = JSON.parse(stringifiedData);
    }
  } catch (error) {
    console.error(error);
  }

  return {
    props: {
      minDate: process.env.CALENDAR_MIN_DAY,
      maxDate: process.env.CALENDAR_MAX_DAY,
      data: data,
      level: level,
    },
  };
};
