import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { checkerString } from '@constants/sys/helper';
import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { Result } from 'types/api';
import { CCAAttendance } from 'types/cca/ccaAttendance';

import { CSVLink } from 'react-csv';

/**
 * Renders a modal for a specific user, displaying all the CCA attendance for the particular user and CCA
 *
 * @param param0 Modal functions and data
 * @returns A modal
 */
export default function LeaderStudentModalComponent({
  isOpen,
  onClose,
  modalData,
}) {
  const [loadingData, setLoadingData] = useState(true);

  const [sessionUserName, setSessionUserName] = useState('');

  const [data, setData] = useState<CCAAttendance[]>([]);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const ccaRecordIDDB = useRef('');
  const sessionEmailDB = useRef('');

  const CSVheaders = [
    { label: 'Session Name', key: 'sessionName' },
    { label: 'CCA Name', key: 'ccaName' },
    { label: 'Date', key: 'dateStr' },
    { label: 'Time', key: 'time' },
    { label: 'Email', key: 'sessionEmail' },
    { label: 'Attendance', key: 'durationStr' },
  ];

  const [CSVdata, setCSVdata] = useState<CCAAttendance[]>([]);
  const [downloadCSV, setDownloadCSV] = useState(false);

  const reset = () => {
    setLoadingData(true);

    setSessionUserName('');

    setData([]);

    setSubmitButtonPressed(false);

    setPageCount(0);
    pageSizeDB.current = PAGESIZE;
    pageIndexDB.current = PAGEINDEX;

    ccaRecordIDDB.current = '';
    sessionEmailDB.current = '';

    setCSVdata([]);
    setDownloadCSV(false);
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const includeActionButton = useCallback(
    async (content: { count: number; res: CCAAttendance[]; }) => {
      if (content.res.length > 0 && content.count > 0) {
        setData(content.res);

        if (content.count % pageSizeDB.current === 0) {
          setPageCount(Math.floor(content.count / pageSizeDB.current));
        } else {
          setPageCount(Math.floor(content.count / pageSizeDB.current) + 1);
        }
      }
    },
    [],
  );

  const fetchMemberSessionOverall = useCallback(
    async (ccaID: string, userEmail: string) => {
      if (checkerString(ccaID) && checkerString(userEmail)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/ccaAttendance/fetch', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: ccaID,
              email: userEmail,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            const dataField: { count: number; res: CCAAttendance[]; } =
              content.msg;
            if (dataField.count > 0 && dataField.res.length > 0) {
              setCSVdata(dataField.res);
            }
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
      }
    },
    [],
  );

  const fetchMemberSession = useCallback(
    async (ccaID: string, userEmail: string) => {
      if (checkerString(ccaID) && checkerString(userEmail)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/ccaAttendance/fetch', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: ccaID,
              email: userEmail,
              limit: pageSizeDB.current,
              skip: pageIndexDB.current,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            await includeActionButton(content.msg);
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
      }
    },
    [includeActionButton],
  );

  const tableChange = useCallback(async () => {
    setLoadingData(true);

    await fetchMemberSession(ccaRecordIDDB.current, sessionEmailDB.current);

    setLoadingData(false);
  }, [fetchMemberSession]);

  const onTableChange = useCallback(
    async ({ pageIndex, pageSize }) => {
      if (
        pageSize !== pageSizeDB.current ||
        pageIndex !== pageIndexDB.current
      ) {
        pageSizeDB.current = pageSize;
        pageIndexDB.current = pageIndex;

        await tableChange();
      }
    },
    [tableChange],
  );

  const handleDownload = useCallback(async () => {
    if (
      checkerString(ccaRecordIDDB.current) &&
      checkerString(sessionEmailDB.current)
    ) {
      await fetchMemberSessionOverall(
        ccaRecordIDDB.current,
        sessionEmailDB.current,
      );

      setDownloadCSV(true);
    }
  }, [fetchMemberSessionOverall]);

  useEffect(() => {
    async function setupData() {
      if (modalData) {
        const sessionUserNameField: string =
          modalData && modalData.sessionName ? modalData.sessionName : '';
        setSessionUserName(sessionUserNameField);

        ccaRecordIDDB.current =
          modalData && modalData.ccaID ? modalData.ccaID : '';
        sessionEmailDB.current =
          modalData && modalData.sessionEmail ? modalData.sessionEmail : '';

        await tableChange();
      }
    }

    if (modalData) {
      setData([]);
      setupData();
    }
  }, [modalData, tableChange]);

  const columns = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'dateStr',
      },
      {
        Header: 'Hours Received',
        accessor: 'durationStr',
      },
      {
        Header: 'Optional Session',
        accessor: 'optional',
      },
    ],
    [],
  );

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={handleModalCloseButton}
      size='full'
      isCentered
      motionPreset='slideInBottom'
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader />
        <ModalBody>
          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />

          {checkerString(sessionUserName) && (
            <Stack spacing={5} w='full' align='center'>
              <Box>
                <Text
                  mt={2}
                  mb={6}
                  textTransform='uppercase'
                  fontSize={{ base: '2xl', sm: '2xl', lg: '3xl' }}
                  lineHeight='5'
                  fontWeight='bold'
                  letterSpacing='tight'
                  color='gray.900'
                >
                  {sessionUserName}
                </Text>
              </Box>
            </Stack>
          )}

          <Box>
            <Stack direction='row' align='center'>
              {!downloadCSV && (
                <Button
                  bg='gray.400'
                  color='white'
                  w='180px'
                  size='lg'
                  _hover={{ bg: 'gray.600' }}
                  onClick={handleDownload}
                >
                  Download CSV
                </Button>
              )}

              {downloadCSV && CSVdata.length > 0 && (
                <Button
                  bg='gray.400'
                  color='white'
                  w='180px'
                  size='lg'
                  _hover={{ bg: 'gray.600' }}
                >
                  <CSVLink
                    data={CSVdata}
                    headers={CSVheaders}
                    filename={`${sessionUserName}.csv`}
                    target='_blank'
                  >
                    Export Attendance
                  </CSVLink>
                </Button>
              )}
            </Stack>
          </Box>

          {!loadingData && data.length > 0 && (
            <Box w='full' overflow='auto'>
              <TableWidget
                id='table-widget-session'
                columns={columns}
                data={data}
                controlledPageCount={pageCount}
                dataHandler={onTableChange}
              />
            </Box>
          )}

          {!loadingData && data.length === 0 && (
            <Box mt={30}>
              <Stack align='center' justify='center'>
                <Text>No sessions found</Text>
              </Stack>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
