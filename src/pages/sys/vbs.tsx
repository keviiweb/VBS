import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';
import {
  Box,
  FormLabel,
  Heading,
  List,
  ListItem,
  Input,
  InputGroup,
  InputLeftAddon,
  SimpleGrid,
  Stack,
  StackDivider,
  Select,
  Text,
  useToast,
  useBreakpointValue,
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
import { actions, levels } from '@constants/sys/admin';
import {
  addDays,
  dateISO,
  fetchCurrentDate,
  locale,
} from '@constants/sys/date';
import hasPermission from '@constants/sys/permission';

import safeJsonStringify from 'safe-json-stringify';
import { type GetServerSideProps } from 'next';

import { type Result } from 'types/api';
import { type Venue } from 'types/vbs/venue';
import { type Session } from 'next-auth/core/types';
import { type Booking } from 'types/vbs/booking';

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
  const [allBooking, setAllBooking] = useState<Booking[]>([]);
  const [startTime, setStartTime] = useState('08:00:00');
  const [endTime, setEndTime] = useState('23:00:00');
  const [modalBookingData, setModalBookingData] = useState<Booking | null>(
    null,
  );
  const viewingDate = useRef(90);
  const [startDateCalendar, setCalendarStartDate] = useState('');
  const [endDateCalendar, setCalendarEndDate] = useState('');

  const [level, setLevel] = useState(levels.USER);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const variantDesktop = useBreakpointValue({ base: 'none', md: 'flex' });
  const variantMobile = useBreakpointValue({ base: 'flex', md: 'none' });

  const generateVenueDropdown = useCallback(async (content: Venue[]) => {
    const selection: JSX.Element[] = [];
    venueData.current = [];

    selection.push(<option key='' value='' aria-label='Default' />);

    for (let key = 0; key < content.length; key += 1) {
      const dataField: Venue = content[key];
      selection.push(
        <option key={dataField.id} value={dataField.id}>
          {dataField.name}
        </option>,
      );

      venueData.current.push(dataField);
    }

    setVenueDropdown(selection);
  }, []);

  const populateCalendar = useCallback(async (content: Booking[]) => {
    const event: CalendarData[] = [];
    let count = 0;

    for (let key = 0; key < content.length; key += 1) {
      const dataField: Booking = content[key];

      let description: string = '';
      if (
        dataField.userName !== undefined &&
        checkerString(dataField.userName)
      ) {
        description = `CCA: ${dataField.cca} NAME: ${dataField.userName}`;
      } else {
        description = `CCA: ${dataField.cca} EMAIL: ${dataField.email}`;
      }

      const e = {
        id: dataField.id,
        title: dataField.title,
        start: dataField.start,
        end: dataField.end,
        extendedProps: {
          description,
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

    setAllBooking(content);
    setEvents(event);
  }, []);

  const fetchBookings = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        setAllBooking([]);
        setEvents([]);

        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/booking/fetch', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id,
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

  const onVenueIDChange = async (event: { target: { value: string; }; }) => {
    if (event.target.value !== undefined) {
      const { value } = event.target;

      for (let key = 0; key < venueData.current.length; key += 1) {
        const ven: Venue = venueData.current[key];
        if (ven.id === value) {
          await fetchBookings(value);
          setVenueID(value);
          setSelectedVenue(ven.name);
          break;
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
    if (info.event.extendedProps.description !== undefined) {
      const bookings: Booking = info.event.extendedProps.booking;
      setModalBookingData(bookings);
    }
  };

  const handleMouseEnter = (info: {
    event: { extendedProps: { description: string; }; title: string; };
  }) => {
    if (info.event.extendedProps.description !== undefined) {
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

  const changeCalendarDates = useCallback(async () => {
    const currentDate: Date = fetchCurrentDate();

    const newStart: Date = addDays(
      currentDate,
      locale,
      -Number(viewingDate.current),
    );
    const newEnd: Date = addDays(
      currentDate,
      locale,
      Number(viewingDate.current),
    );

    setCalendarStartDate(dateISO(newStart));
    setCalendarEndDate(dateISO(newEnd));
  }, []);

  useEffect(() => {
    async function fetchData(propsField: any) {
      setIsLoading(true);

      setLevel(propsField.level);

      minDate.current =
        propsField.minDate !== undefined
          ? (propsField.minDate as number)
          : minDate.current;
      maxDate.current =
        propsField.maxDate !== undefined
          ? (propsField.maxDate as number)
          : maxDate.current;

      viewingDate.current =
        propsField.viewingDate !== undefined
          ? (propsField.viewingDate as number)
          : viewingDate.current;

      await changeCalendarDates();

      if (propsField.data !== undefined && propsField !== null) {
        const res: Result = propsField.data;
        if (res.msg.length > 0) {
          if (res.status) {
            const result: Venue[] = res.msg;
            if (result.length > 0 && result !== null && result !== undefined) {
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
  }, [props, generateVenueDropdown, changeCalendarDates]);

  const handleSearch = (event: { target: { value: string; }; }) => {
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
              onClose={() => {
                setSubmitButtonPressed(false);
              }}
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
              {checkerString(selectedVenue) && (
                <Text>Selected Venue: {selectedVenue}</Text>
              )}

              {venueDropdown.length > 0 && (
                <Stack spacing={2} w='full' mb='10'>
                  <FormLabel>Select Venue</FormLabel>
                  <Select value={venueID} onChange={onVenueIDChange} size='sm'>
                    {venueDropdown}
                  </Select>
                </Stack>
              )}

              <Stack display={variantDesktop}>
                {venueDropdown.length > 0 && checkerString(selectedVenue) && (
                  <BookingCalendar
                    slotMax={endTime}
                    slotMin={startTime}
                    events={events}
                    eventClick={handleEventClick}
                    eventMouseEnter={handleMouseEnter}
                    eventMouseLeave={handleMouseLeave}
                    startDate={startDateCalendar}
                    endDate={endDateCalendar}
                  />
                )}
              </Stack>

              <Stack display={variantMobile}>
                {venueDropdown.length > 0 && checkerString(selectedVenue) && (
                  <Stack divider={<StackDivider borderColor='gray.600' />}>
                    {allBooking.map((item: Booking, idx: number) => (
                      <List spacing={2} key={`booking--${item.id}-`}>
                        {item.cca !== undefined && checkerString(item.cca) && (
                          <ListItem key={`booking-${item.id}-cca-${idx}`}>
                            <Text as='span' fontWeight='bold'>
                              CCA:{' '}
                            </Text>
                            {item.cca}
                          </ListItem>
                        )}
                        {item.purpose !== undefined &&
                          checkerString(item.purpose) && (
                            <ListItem key={`booking-${item.id}-purpose-${idx}`}>
                              <Text as='span' fontWeight='bold'>
                                Purpose:{' '}
                              </Text>
                              {item.purpose}
                            </ListItem>
                          )}
                        {item.dateStr !== undefined &&
                          checkerString(item.dateStr) && (
                            <ListItem key={`booking-${item.id}-dateStr-${idx}`}>
                              <Text as='span' fontWeight='bold'>
                                Date:{' '}
                              </Text>
                              {item.dateStr}
                            </ListItem>
                          )}
                        {item.timeSlots !== undefined &&
                          checkerString(item.timeSlots) && (
                            <ListItem
                              key={`booking-${item.id}-timeSlots-${idx}`}
                            >
                              <Text as='span' fontWeight='bold'>
                                Timing:{' '}
                              </Text>
                              {item.timeSlots}
                            </ListItem>
                          )}
                      </List>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>

            {hasPermission(level, actions.MANAGE_BOOKING_REQUEST) && (
              <BookingModal
                isBookingRequest={false}
                isOpen={!(modalBookingData == null)}
                onClose={() => {
                  setModalBookingData(null);
                }}
                modalData={modalBookingData}
                isAdmin
              />
            )}

            {!hasPermission(level, actions.MANAGE_BOOKING_REQUEST) && (
              <BookingModal
                isBookingRequest={false}
                isOpen={!(modalBookingData == null)}
                onClose={() => {
                  setModalBookingData(null);
                }}
                modalData={modalBookingData}
                isAdmin={false}
              />
            )}

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
              {filteredData.length > 0 ? filteredData : cards}
            </MotionSimpleGrid>

            <VenueBookingModal
              isOpen={modalData}
              onClose={() => {
                setModalData(null);
              }}
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
    'public, s-maxage=7200, stale-while-revalidate=100000',
  );

  let data: Result | null = null;
  let level: number = levels.USER;

  try {
    const session: Session | null = await currentSession(null, null, cont);
    if (session !== null) {
      if (session.user.admin !== undefined) {
        level = session.user.admin;
      }
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
      viewingDate: process.env.VIEW_BOOKING_CALENDAR_DAY,
      data,
      level,
    },
  };
};
