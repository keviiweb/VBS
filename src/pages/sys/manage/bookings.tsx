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
import TableWidget from '@components/sys/vbs/TableWidget';
import BookingModal from '@components/sys/vbs/BookingModal';

import { Result } from 'types/api';
import { BookingRequest } from 'types/bookingReq';

import { checkerString } from '@constants/sys/helper';

const MotionBox = motion(Box);

export default function ManageBooking() {
  const [modalData, setModalData] = useState(null);

  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState(null);

  let generateActionButton;
  let fetchData;

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const handleDetails = useCallback((content: BookingRequest) => {
    setModalData(content);
  }, []);

  const handleCancel = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        try {
          const rawResponse = await fetch('/api/bookingReq/cancel', {
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
              title: 'Request cancelled.',
              description: 'An email has been sent to the requester',
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
      }
    },
    [toast, fetchData],
  );

  const includeActionButton = useCallback(
    async (content) => {
      if (
        (content.count !== undefined || content.count !== null) &&
        (content.res !== undefined || content.res !== null)
      ) {
        const booking: BookingRequest[] = content.res;
        if (booking !== []) {
          for (let key = 0; key < booking.length; key += 1) {
            if (booking[key]) {
              const dataField: BookingRequest = booking[key];
              const buttons = await generateActionButton(dataField);
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

  generateActionButton = useCallback(
    async (content: BookingRequest) => {
      let button = null;

      if (content.status === 'PENDING' || content.status === 'APPROVED') {
        button = (
          <Stack direction='column'>
            <Button
              size='sm'
              leftIcon={<CloseIcon />}
              onClick={() => handleCancel(content.id)}
            >
              Cancel
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
    },
    [handleDetails, handleCancel],
  );

  fetchData = useCallback(async () => {
    setLoadingData(true);
    setData(null);
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

      setLoadingData(false);
    } catch (error) {
      console.error(error);
    }
  }, [includeActionButton]);

  const fetchDataTable = useCallback(async () => {
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

  const onTableChange = useCallback(
    async ({ pageIndex, pageSize }) => {
      if (
        pageSize !== pageSizeDB.current ||
        pageIndex !== pageIndexDB.current
      ) {
        pageSizeDB.current = pageSize;
        pageIndexDB.current = pageIndex;

        await fetchDataTable();
      }
    },
    [fetchDataTable],
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

          {!loadingData && data && data !== [] && data.length > 0 && (
            <Box minWidth='full' mt={30} overflow='auto'>
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
            isOpen={!!modalData}
            onClose={() => setModalData(null)}
            modalData={modalData}
            isAdmin={undefined}
            isBookingRequest={false}
          />
        </MotionBox>
      </Box>
    </Auth>
  );
}
