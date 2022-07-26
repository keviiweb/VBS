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
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Select,
  useToast,
} from '@chakra-ui/react';
import {
  CheckIcon,
  CloseIcon,
  InfoOutlineIcon,
  InfoIcon,
} from '@chakra-ui/icons';

import Auth from '@components/sys/Auth';
import TableWidget from '@components/sys/misc/TableWidget';
import BookingModal from '@components/sys/vbs/BookingModal';
import BookingRejectModal from '@components/sys/vbs/BookingRejectModal';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import { Result } from 'types/api';
import { BookingRequest } from 'types/vbs/bookingReq';

import { checkerNumber, checkerString } from '@constants/sys/helper';
import { levels } from '@constants/sys/bookingReq';

const MotionSimpleGrid = motion(SimpleGrid);

/**
 * Renders a component that displays the list of bookings and allow users to approve bookings
 *
 * Approval of bookings is an ADMIN or OWNER level task
 *
 * @param props Permission level of user
 * @returns Manage User page
 */
export default function ManageBooking() {
  const [modalData, setModalData] = useState<BookingRequest | null>(null);

  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<BookingRequest[]>([]);

  const [rejectModalData, setRejectModalData] = useState<BookingRequest | null>(
    null,
  );

  let handleTabChange: any;
  const bookingChoiceDB = useRef(0);

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const [bookingChoice, setBookingChoice] = useState(0);
  const [bookingChoiceDropdown, setBookingChoiceDropdown] = useState<
    JSX.Element[]
  >([]);

  const handleHover = () => {
    toast.closeAll();

    toast({
      description:
        'Select between different dropdown menu items to retrieve the latest data',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleApprove = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        setSubmitButtonPressed(true);
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
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            await handleTabChange(bookingChoiceDB.current);
          } else {
            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
      }
    },
    [handleTabChange, toast],
  );

  const handleRejectWReason = useCallback(
    async (contentField: BookingRequest, reason: string) => {
      const { id } = contentField;
      if (id !== undefined && checkerString(id)) {
        setSubmitButtonPressed(true);
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
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            await handleTabChange(bookingChoiceDB.current);
          } else {
            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
      }
    },
    [handleTabChange, toast],
  );

  const dataFromBookingRejectVenueModal = useCallback(
    async (reason: string, content: BookingRequest) => {
      if (checkerString(reason)) {
        await handleRejectWReason(content, reason);
        return true;
      }
      return false;
    },
    [handleRejectWReason],
  );

  const handleReject = useCallback(async (content: BookingRequest) => {
    try {
      const { id } = content;
      if (id !== undefined && checkerString(id)) {
        setRejectModalData(content);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDetails = useCallback((content: BookingRequest) => {
    setModalData(content);
  }, []);

  const generateActionButton = useCallback(
    async (content: BookingRequest, action: number) => {
      switch (action) {
        case levels.ALL: {
          const { id, editable } = content;
          if (content.status === 'PENDING') {
            if (id !== undefined && editable !== undefined) {
              if (editable) {
                const button: JSX.Element = (
                  <Stack direction='column'>
                    <Button
                      key={`approve-pending-all-button-${id}`}
                      size='sm'
                      leftIcon={<CheckIcon />}
                      disabled={submitButtonPressed}
                      onClick={() => handleApprove(id)}
                    >
                      Approve
                    </Button>
                    <Button
                      key={`reject-pending-all-button-${id}`}
                      size='sm'
                      leftIcon={<CloseIcon />}
                      disabled={submitButtonPressed}
                      onClick={() => handleReject(content)}
                    >
                      Reject
                    </Button>
                    <Button
                      key={`details-pending-all-button-${id}`}
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
              const button: JSX.Element = (
                <Stack direction='column'>
                  <Button
                    key={`details-pending-all-button-${id}`}
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
            return null;
          }
          if (content.status === 'APPROVED') {
            if (id !== undefined && editable !== undefined) {
              if (editable) {
                const button2: JSX.Element = (
                  <Stack direction='column'>
                    <Button
                      key={`reject-approve-all-button-${id}`}
                      size='sm'
                      leftIcon={<CloseIcon />}
                      disabled={submitButtonPressed}
                      onClick={() => handleReject(content)}
                    >
                      Reject
                    </Button>
                    <Button
                      key={`details-approve-all-button-${id}`}
                      size='sm'
                      leftIcon={<InfoOutlineIcon />}
                      onClick={() => handleDetails(content)}
                    >
                      View Details
                    </Button>
                  </Stack>
                );
                return button2;
              }
              const button2: JSX.Element = (
                <Stack direction='column'>
                  <Button
                    key={`details-approve-all-button-${id}`}
                    size='sm'
                    leftIcon={<InfoOutlineIcon />}
                    onClick={() => handleDetails(content)}
                  >
                    View Details
                  </Button>
                </Stack>
              );
              return button2;
            }
            return null;
          }
          if (id !== undefined) {
            const button: JSX.Element = (
              <Button
                key={`details-details-all-button-${id}`}
                size='sm'
                leftIcon={<InfoOutlineIcon />}
                onClick={() => handleDetails(content)}
              >
                View Details
              </Button>
            );
            return button;
          }
          return null;
        }
        case levels.APPROVED: {
          const { id, editable } = content;
          if (id !== undefined && editable !== undefined) {
            if (editable) {
              const button2: JSX.Element = (
                <Stack direction='column'>
                  <Button
                    key={`reject-approve-button-${id}`}
                    size='sm'
                    leftIcon={<CloseIcon />}
                    disabled={submitButtonPressed}
                    onClick={() => handleReject(content)}
                  >
                    Reject
                  </Button>
                  <Button
                    key={`details-approve-button-${id}`}
                    size='sm'
                    leftIcon={<InfoOutlineIcon />}
                    onClick={() => handleDetails(content)}
                  >
                    View Details
                  </Button>
                </Stack>
              );
              return button2;
            }
            const button2: JSX.Element = (
              <Stack direction='column'>
                <Button
                  key={`details-approve-button-${id}`}
                  size='sm'
                  leftIcon={<InfoOutlineIcon />}
                  onClick={() => handleDetails(content)}
                >
                  View Details
                </Button>
              </Stack>
            );
            return button2;
          }
          return null;
        }
        case levels.REJECTED: {
          const { id } = content;
          if (id !== undefined) {
            const button3: JSX.Element = (
              <Button
                key={`details-reject-button-${id}`}
                size='sm'
                leftIcon={<InfoOutlineIcon />}
                onClick={() => handleDetails(content)}
              >
                View Details
              </Button>
            );
            return button3;
          }
          return null;
        }
        case levels.PENDING: {
          if (content.status === 'PENDING') {
            const { id, editable } = content;
            if (id !== undefined && editable !== undefined) {
              if (editable) {
                const button: JSX.Element = (
                  <Stack direction='column'>
                    <Button
                      key={`approve-pending-button-${id}`}
                      size='sm'
                      leftIcon={<CheckIcon />}
                      disabled={submitButtonPressed}
                      onClick={() => handleApprove(id)}
                    >
                      Approve
                    </Button>
                    <Button
                      key={`reject-pending-button-${id}`}
                      size='sm'
                      leftIcon={<CloseIcon />}
                      disabled={submitButtonPressed}
                      onClick={() => handleReject(content)}
                    >
                      Reject
                    </Button>
                    <Button
                      key={`details-pending-button-${id}`}
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
              const button: JSX.Element = (
                <Stack direction='column'>
                  <Button
                    key={`details-pending-button-${id}`}
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
            return null;
          }
          const { id } = content;
          if (id !== undefined) {
            const button: JSX.Element = (
              <Button
                key={`details-no-status-pending-button-${id}`}
                size='sm'
                leftIcon={<InfoOutlineIcon />}
                onClick={() => handleDetails(content)}
              >
                View Details
              </Button>
            );
            return button;
          }
          return null;
        }

        default:
          return null;
      }
    },
    [handleApprove, handleDetails, handleReject, submitButtonPressed],
  );

  const includeActionButton = useCallback(
    async (
      content: { count: number; res: BookingRequest[] },
      action: number,
    ) => {
      if (
        (content.count !== undefined || content.count !== null) &&
        (content.res !== undefined || content.res !== null)
      ) {
        const booking: BookingRequest[] = content.res;
        if (booking.length > 0) {
          for (let key = 0; key < booking.length; key += 1) {
            if (booking[key]) {
              const dataField: BookingRequest = booking[key];
              const buttons = await generateActionButton(dataField, action);
              dataField.action = buttons;
            }
          }
          setData(booking);
        }

        if (content.count % pageSizeDB.current === 0) {
          setPageCount(Math.floor(content.count / pageSizeDB.current));
        } else {
          setPageCount(Math.floor(content.count / pageSizeDB.current) + 1);
        }
      }
    },
    [generateActionButton],
  );

  const fetchAllData = useCallback(async () => {
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
        await includeActionButton(content.msg, levels.ALL);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchApprovedData = useCallback(async () => {
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
        await includeActionButton(content.msg, levels.APPROVED);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchRejectedData = useCallback(async () => {
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
        await includeActionButton(content.msg, levels.REJECTED);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchPendingData = useCallback(async () => {
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
        await includeActionButton(content.msg, levels.PENDING);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const tableChange = useCallback(
    async (index: number) => {
      setSubmitButtonPressed(true);

      switch (index) {
        case levels.PENDING:
          await fetchPendingData();
          break;
        case levels.APPROVED:
          await fetchApprovedData();
          break;
        case levels.REJECTED:
          await fetchRejectedData();
          break;
        case levels.ALL:
          await fetchAllData();
          break;
        default:
          break;
      }

      setSubmitButtonPressed(false);
    },
    [fetchPendingData, fetchApprovedData, fetchRejectedData, fetchAllData],
  );

  const onTableChange = useCallback(
    async ({ pageIndex, pageSize }) => {
      if (
        pageSize !== pageSizeDB.current ||
        pageIndex !== pageIndexDB.current
      ) {
        pageSizeDB.current = pageSize;
        pageIndexDB.current = pageIndex;

        await tableChange(bookingChoiceDB.current);
      }
    },
    [tableChange],
  );

  const onBookingChoiceChange = useCallback(
    async (event: { target: { value: string } }) => {
      if (event.target.value) {
        const { value } = event.target;
        if (
          checkerNumber(Number(value)) &&
          Number(value) !== bookingChoiceDB.current
        ) {
          setSubmitButtonPressed(true);
          setBookingChoice(Number(value));
          bookingChoiceDB.current = Number(value);

          pageIndexDB.current = PAGEINDEX;
          pageSizeDB.current = PAGESIZE;

          await handleTabChange(Number(value));
          setSubmitButtonPressed(false);
        }
      }
    },
    [handleTabChange],
  );

  handleTabChange = useCallback(
    async (id: number) => {
      setLoadingData(true);
      setData([]);

      switch (id) {
        case levels.PENDING:
          await fetchPendingData();
          break;
        case levels.APPROVED:
          await fetchApprovedData();
          break;
        case levels.REJECTED:
          await fetchRejectedData();
          break;
        case levels.ALL:
          await fetchAllData();
          break;
        default:
          break;
      }

      setLoadingData(false);
    },
    [fetchPendingData, fetchApprovedData, fetchRejectedData, fetchAllData],
  );

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

  const createBookingChoiceDropDownMenu = useCallback(() => {
    const selection: JSX.Element[] = [];
    selection.push(<option key='' value='' aria-label='Default' />);

    Object.keys(levels).forEach((key) => {
      if (levels[key]) {
        selection.push(
          <option key={levels[key]} value={levels[key]}>
            {key}
          </option>,
        );
      }
    });

    setBookingChoiceDropdown(selection);
  }, []);

  useEffect(() => {
    createBookingChoiceDropDownMenu();
  }, [createBookingChoiceDropDownMenu]);

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
          key='booking-table'
        >
          <Stack direction='row'>
            <Heading size='sm' mb={4}>
              Booking Table
            </Heading>
            <InfoIcon onMouseEnter={handleHover} />
          </Stack>

          <Stack spacing={2} w='full' mb='10'>
            <FormLabel>Select Bookings</FormLabel>
            <Select
              value={bookingChoice}
              onChange={onBookingChoiceChange}
              size='sm'
            >
              {bookingChoiceDropdown}
            </Select>
          </Stack>

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
            <Box w='full' overflow='auto'>
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
        </Box>
      </MotionSimpleGrid>
    </Auth>
  );
}
