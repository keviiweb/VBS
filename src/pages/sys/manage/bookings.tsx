import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { Button, Box, Stack, Text, useToast } from '@chakra-ui/react';
import { CloseIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { cardVariant } from '@root/motion';
import { motion } from 'framer-motion';

import Auth from '@components/sys/Auth';
import TableWidget from '@components/sys/misc/TableWidget';
import BookingModal from '@components/sys/vbs/BookingModal';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { Result } from 'types/api';
import { BookingRequest } from 'types/vbs/bookingReq';

import { checkerString } from '@constants/sys/helper';

const MotionBox = motion(Box);

/**
 * Renders a page containing all the bookings made by the user themselves
 *
 * Users can see the details of a booking request or cancel them
 *
 * @returns ManageBooking page
 */
export default function ManageBooking() {
  const [modalData, setModalData] = useState<BookingRequest | null>(null);

  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<BookingRequest[]>([]);

  let generateActionButton: any;
  let fetchData: any;

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const handleDetails = useCallback((content: BookingRequest) => {
    setModalData(content);
  }, []);

  const handleCancel = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/bookingReq/cancel', {
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
            toast({
              title: 'Request cancelled.',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            await fetchData();
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
    [toast, fetchData],
  );

  const includeActionButton = useCallback(
    async (content: { count: number; res: BookingRequest[]; }) => {
      if (
        (content.count !== undefined || content.count !== null) &&
        (content.res !== undefined || content.res !== null)
      ) {
        const booking: BookingRequest[] = content.res;
        if (booking.length > 0) {
          for (let key = 0; key < booking.length; key += 1) {
            if (booking[key]) {
              const dataField: BookingRequest = booking[key];
              const buttons = await generateActionButton(dataField);
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

  generateActionButton = useCallback(
    async (content: BookingRequest) => {
      if (content.status === 'PENDING' || content.status === 'APPROVED') {
        const { id, editable } = content;
        if (id !== undefined && editable !== undefined) {
          if (editable) {
            const button: JSX.Element = (
              <Stack direction='column'>
                <Button
                  key={`cancel-button-${id}`}
                  size='sm'
                  leftIcon={<CloseIcon />}
                  disabled={submitButtonPressed}
                  onClick={async () => await handleCancel(id)}
                >
                  Cancel
                </Button>
                <Button
                  key={`details-button-${id}`}
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
                key={`details-button-${id}`}
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
            key={`details-button-${id}`}
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
    },
    [handleDetails, handleCancel, submitButtonPressed],
  );

  const fetchDataFromDB = useCallback(async () => {
    try {
      const rawResponse = await fetch(
        `/api/bookingReq/fetch?q=USER&limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg);
      }
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  fetchData = useCallback(async () => {
    setLoadingData(true);
    setSubmitButtonPressed(true);
    setData([]);

    await fetchDataFromDB();

    setLoadingData(false);
    setSubmitButtonPressed(false);
  }, [fetchDataFromDB]);

  const onTableChange = useCallback(
    async ({ pageIndex, pageSize }) => {
      if (
        pageSize !== pageSizeDB.current ||
        pageIndex !== pageIndexDB.current
      ) {
        pageSizeDB.current = pageSize;
        pageIndexDB.current = pageIndex;

        await fetchDataFromDB();
      }
    },
    [fetchDataFromDB],
  );

  useEffect(() => {
    if (loadingData) {
      fetchData();
    }
  }, [fetchData, loadingData]);

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
        Header: 'Name',
        accessor: 'userName',
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

  return (
    <Auth admin={undefined}>
      <Box bg='white' borderRadius='lg' p={8} color='gray.700' shadow='base'>
        <MotionBox variants={cardVariant} key='1'>
          {loadingData && !data && (
            <Box mt={30}>
              <Stack align='center' justify='center'>
                <Text>Loading Please wait...</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length === 0 && (
            <Box mt={30}>
              <Stack align='center' justify='center'>
                <Text>No bookings found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data && data.length > 0 && (
            <Box w='full' overflow='auto'>
              <Stack align='center' justify='center' spacing={30}>
                <TableWidget
                  id='manage-booking-table'
                  columns={columns}
                  data={data}
                  controlledPageCount={pageCount}
                  dataHandler={onTableChange}
                />
              </Stack>
            </Box>
          )}

          <BookingModal
            isOpen={!(modalData == null)}
            onClose={() => setModalData(null)}
            modalData={modalData}
            isAdmin={undefined}
            isBookingRequest
          />

          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />
        </MotionBox>
      </Box>
    </Auth>
  );
}
