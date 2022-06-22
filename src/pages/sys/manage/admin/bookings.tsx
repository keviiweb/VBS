import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  Button,
  Box,
  FormLabel,
  Text,
  Tabs,
  TabList,
  Tab,
  SimpleGrid,
  Stack,
  Select,
  useToast,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, InfoOutlineIcon } from '@chakra-ui/icons';

import Auth from '@components/sys/Auth';
import TableWidget from '@components/sys/vbs/TableWidget';
import BookingModal from '@components/sys/vbs/BookingModal';
import BookingCalendar from '@components/sys/vbs/BookingCalendar';
import BookingRejectModal from '@components/sys/vbs/BookingRejectModal';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';
import { Venue } from 'types/venue';
import { Booking } from 'types/booking';

import { checkerString } from '@constants/sys/helper';

const MotionSimpleGrid = motion(SimpleGrid);

export default function ManageBooking() {
  const [modalData, setModalData] = useState(null);

  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState(null);
  const ALL: number = 3;
  const PENDING: number = 0;
  const APPROVED: number = 1;
  const REJECTED: number = 2;

  const [rejectModalData, setRejectModalData] = useState(null);
  const [modalBookingData, setModalBookingData] = useState(null);

  const tabIndexData = useRef(0);

  const venueData = useRef([]);
  const [venueDropdown, setVenueDropdown] = useState([]);
  const [venueID, setVenueID] = useState('');
  const venueIDDB = useRef('');
  const [selectedVenue, setSelectedVenue] = useState('');

  const [events, setEvents] = useState(null);
  const [startTime, setStartTime] = useState('08:00:00');
  const [endTime, setEndTime] = useState('23:00:00');

  let handleTabChange;
  let fetchBookings;

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const handleApprove = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        try {
          const rawResponse = await fetch('/api/bookingReq/approve', {
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
            toast({
              title: 'Request approved.',
              description: 'An email has been sent to the requester',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            await handleTabChange(tabIndexData.current);
            await fetchBookings(venueIDDB.current);
          } else {
            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }

          return true;
        } catch (error) {
          return false;
        }
      }

      return false;
    },
    [handleTabChange, toast, fetchBookings],
  );

  const handleRejectWReason = useCallback(
    async (contentField: BookingRequest, reason: string) => {
      const { id } = contentField;
      if (checkerString(id)) {
        try {
          const rawResponse = await fetch('/api/bookingReq/reject', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: id,
              reason: reason,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            toast({
              title: 'Request rejected.',
              description: 'An email has been sent to the requester',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            await handleTabChange(tabIndexData.current);
            await fetchBookings(venueIDDB.current);
          } else {
            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
          return true;
        } catch (error) {
          return false;
        }
      } else {
        return false;
      }
    },
    [handleTabChange, toast, fetchBookings],
  );

  const dataFromBookingRejectVenueModal = async (
    reason: string,
    content: BookingRequest,
  ) => {
    if (checkerString(reason)) {
      await handleRejectWReason(content, reason);
      return true;
    }
    return false;
  };

  const handleReject = useCallback(async (content: BookingRequest) => {
    const { id } = content;
    if (checkerString(id)) {
      setRejectModalData(content);
    }

    return false;
  }, []);

  const handleDetails = useCallback((content: BookingRequest) => {
    setModalData(content);
  }, []);

  const generateActionButton = useCallback(
    async (content: BookingRequest, action: number) => {
      let button = null;

      switch (action) {
        case ALL:
          if (content.status === 'PENDING') {
            button = (
              <Stack direction='column'>
                <Button
                  size='sm'
                  leftIcon={<CheckIcon />}
                  onClick={() => handleApprove(content.id)}
                >
                  Approve
                </Button>
                <Button
                  size='sm'
                  leftIcon={<CloseIcon />}
                  onClick={() => handleReject(content)}
                >
                  Reject
                </Button>
                <Button
                  size='sm'
                  leftIcon={<InfoOutlineIcon />}
                  onClick={() => handleDetails(content)}
                >
                  View Details
                </Button>
              </Stack>
            );
            return button;
          }
          button = (
            <Button
              size='sm'
              leftIcon={<InfoOutlineIcon />}
              onClick={() => handleDetails(content)}
            >
              View Details
            </Button>
          );
          return button;

        case APPROVED:
          button = (
            <Button
              size='sm'
              leftIcon={<InfoOutlineIcon />}
              onClick={() => handleDetails(content)}
            >
              View Details
            </Button>
          );
          return button;
        case REJECTED:
          button = (
            <Button
              size='sm'
              leftIcon={<InfoOutlineIcon />}
              onClick={() => handleDetails(content)}
            >
              View Details
            </Button>
          );
          return button;
        case PENDING:
          if (content.status === 'PENDING') {
            button = (
              <Stack direction='column'>
                <Button
                  size='sm'
                  leftIcon={<CheckIcon />}
                  onClick={() => handleApprove(content.id)}
                >
                  Approve
                </Button>
                <Button
                  size='sm'
                  leftIcon={<CloseIcon />}
                  onClick={() => handleReject(content)}
                >
                  Reject
                </Button>
                <Button
                  size='sm'
                  leftIcon={<InfoOutlineIcon />}
                  onClick={() => handleDetails(content)}
                >
                  View Details
                </Button>
              </Stack>
            );
            return button;
          }
          button = (
            <Button
              size='sm'
              leftIcon={<InfoOutlineIcon />}
              onClick={() => handleDetails(content)}
            >
              View Details
            </Button>
          );
          return button;
        default:
          return button;
      }
    },
    [handleApprove, handleDetails, handleReject],
  );

  const includeActionButton = useCallback(
    async (content, action: number) => {
      if (
        (content.count !== undefined || content.count !== null) &&
        (content.res !== undefined || content.res !== null)
      ) {
        const booking: BookingRequest[] = content.res;
        if (booking !== []) {
          for (let key = 0; key < booking.length; key += 1) {
            if (booking[key]) {
              const dataField: BookingRequest = booking[key];
              const buttons = await generateActionButton(dataField, action);
              dataField.action = buttons;
            }
          }
          setData(booking);
        }

        setPageCount(Math.floor(content.count / pageSizeDB.current) + 1);
      }
    },
    [generateActionButton],
  );

  const fetchAllDataTable = useCallback(async () => {
    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, ALL);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchApprovedDataTable = useCallback(async () => {
    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?q=APPROVED&limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, APPROVED);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchRejectedDataTable = useCallback(async () => {
    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?q=REJECTED&limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, REJECTED);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchPendingDataTable = useCallback(async () => {
    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?q=PENDING&limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, PENDING);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const tableChange = useCallback(
    async (index: number) => {
      switch (index) {
        case PENDING:
          await fetchPendingDataTable();
          break;
        case APPROVED:
          await fetchApprovedDataTable();
          break;
        case REJECTED:
          await fetchRejectedDataTable();
          break;
        case ALL:
          await fetchAllDataTable();
          break;
        default:
          break;
      }
    },
    [
      fetchPendingDataTable,
      fetchApprovedDataTable,
      fetchRejectedDataTable,
      fetchAllDataTable,
    ],
  );

  const onTableChange = useCallback(
    async ({ pageIndex, pageSize }) => {
      if (
        pageSize !== pageSizeDB.current ||
        pageIndex !== pageIndexDB.current
      ) {
        pageSizeDB.current = pageSize;
        pageIndexDB.current = pageIndex;

        await tableChange(tabIndexData.current);
      }
    },
    [tableChange],
  );

  const fetchAllData = useCallback(async () => {
    setLoadingData(true);
    setData(null);
    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, ALL);
      }

      setLoadingData(false);
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchApprovedData = useCallback(async () => {
    setLoadingData(true);
    setData(null);
    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?q=APPROVED&limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, APPROVED);
      }

      setLoadingData(false);
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchRejectedData = useCallback(async () => {
    setLoadingData(true);
    setData(null);

    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?q=REJECTED&limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, REJECTED);
      }
      setLoadingData(false);
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchPendingData = useCallback(async () => {
    setLoadingData(true);
    setData(null);

    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?q=PENDING&limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, PENDING);
      }
      setLoadingData(false);
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  handleTabChange = useCallback(
    async (index: number) => {
      tabIndexData.current = index;
      pageIndexDB.current = PAGEINDEX;
      pageSizeDB.current = PAGESIZE;

      switch (index) {
        case PENDING:
          await fetchPendingData();
          break;
        case APPROVED:
          await fetchApprovedData();
          break;
        case REJECTED:
          await fetchRejectedData();
          break;
        case ALL:
          await fetchAllData();
          break;
        default:
          break;
      }
    },
    [fetchPendingData, fetchApprovedData, fetchAllData, fetchRejectedData],
  );

  const generateVenueDropdown = useCallback(async (contentRes) => {
    const content: Venue[] = contentRes.res;
    const selection = [];
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

  const fetchVenue = useCallback(async () => {
    try {
      const rawResponse = await fetch('/api/venue/fetch', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        generateVenueDropdown(content.msg);
      }
    } catch (error) {
      console.error(error);
    }
  }, [generateVenueDropdown]);

  const populateCalendar = useCallback(async (content: Booking[]) => {
    const event = [];
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
          setStartTime(dataField.startHour);
          setEndTime(dataField.endHour);
          count += 1;
        }
      }
    }

    setEvents(event);
  }, []);

  fetchBookings = useCallback(
    async (id: string) => {
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
        booking: BookingRequest;
        description: string;
      };
      title: string;
    };
  }) => {
    if (info.event.extendedProps.description) {
      const bookings: BookingRequest = info.event.extendedProps.booking;
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

  const columns = useMemo(
    () => [
      {
        Header: 'Venue',
        accessor: 'venue',
      },
      {
        Header: 'Date',
        accessor: 'dateStr',
      },
      {
        Header: 'Timeslot(s)',
        accessor: 'timeSlots',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'CCA',
        accessor: 'cca',
      },
      {
        Header: 'Purpose',
        accessor: 'purpose',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Actions',
        accessor: 'action',
      },
    ],
    [],
  );

  useEffect(() => {
    fetchPendingData();
    fetchVenue();
  }, [fetchPendingData, fetchVenue]);

  return (
    <Auth admin>
      <MotionSimpleGrid
        mt='3'
        columns={{ base: 1, md: 1, lg: 1 }}
        spacing='2em'
        minH='600px'
        variants={parentVariant}
        initial='initial'
        animate='animate'
      >
        <Box
          bg='white'
          borderRadius='lg'
          width={{ base: 'full', md: 'full', lg: 'full' }}
          p={8}
          color='gray.700'
          shadow='base'
        >
          {selectedVenue && <Text>Selected Venue: {selectedVenue}</Text>}

          {venueDropdown && (
            <Stack spacing={2} w='full' mb='10'>
              <FormLabel>Select Venue</FormLabel>
              <Select value={venueID} onChange={onVenueIDChange} size='sm'>
                {venueDropdown}
              </Select>
            </Stack>
          )}

          <BookingCalendar
            slotMax={endTime}
            slotMin={startTime}
            events={events}
            eventClick={handleEventClick}
            eventMouseEnter={handleMouseEnter}
            eventMouseLeave={handleMouseLeave}
          />
        </Box>

        <Box
          bg='white'
          borderRadius='lg'
          width={{ base: 'full', md: 'full', lg: 'full' }}
          p={8}
          color='gray.700'
          shadow='base'
        >
          <Tabs
            onChange={handleTabChange}
            size='sm'
            isManual
            isLazy
            isFitted
            variant='enclosed'
          >
            <TabList>
              <Tab>Pending Approval</Tab>
              <Tab>Approved</Tab>
              <Tab>Rejected</Tab>
              <Tab>All Bookings</Tab>
            </TabList>
            {loadingData && !data && (
              <Box mt={30}>
                <Stack align='center' justify='center'>
                  <Text>Loading Please wait...</Text>
                </Stack>
              </Box>
            )}

            {!loadingData && data && data.length === 0 && (
              <Box mt={30}>
                <Stack align='center' justify='center'>
                  <Text>No bookings found</Text>
                </Stack>
              </Box>
            )}

            {!loadingData && data && data !== [] && data.length > 0 && (
              <Box w='full' mt={30} overflow='auto'>
                <Stack align='center' justify='center' spacing={30}>
                  <TableWidget
                    key={1}
                    columns={columns}
                    data={data}
                    controlledPageCount={pageCount}
                    dataHandler={onTableChange}
                  />
                </Stack>
              </Box>
            )}

            <BookingModal
              isBookingRequest={false}
              isOpen={!!modalBookingData}
              onClose={() => setModalBookingData(null)}
              modalData={modalBookingData}
              isAdmin
            />
            <BookingModal
              isBookingRequest
              isOpen={!!modalData}
              onClose={() => setModalData(null)}
              modalData={modalData}
              isAdmin
            />
            <BookingRejectModal
              isOpen={!!rejectModalData}
              onClose={() => setRejectModalData(null)}
              modalData={rejectModalData}
              dataHandler={dataFromBookingRejectVenueModal}
            />
          </Tabs>
        </Box>
      </MotionSimpleGrid>
    </Auth>
  );
}
