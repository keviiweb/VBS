import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import {
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { checkerString } from '@constants/sys/helper';
import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { Result } from 'types/api';
import { CCASession } from 'types/cca/ccaSession';
import { Session } from 'next-auth/core/types';

import SessionModal from '@components/sys/cca/SessionModal';

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
  userSession,
}) {
  const [specificCCAData, setSpecificCCAData] = useState<CCASession | null>(
    null,
  );

  const [loadingData, setLoadingData] = useState(true);

  const [ccaName, setCCAName] = useState('');
  const [attendance, setAttendance] = useState('');

  const [data, setData] = useState<CCASession[]>([]);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const ccaRecordIDDB = useRef('');
  const ccaNameDB = useRef('');

  const [session, setSession] = useState<Session | null>(null);

  const reset = () => {
    setSpecificCCAData(null);
    setLoadingData(true);

    setCCAName('');
    setAttendance('');

    setData([]);
    setSubmitButtonPressed(false);

    setPageCount(0);
    pageSizeDB.current = PAGESIZE;
    pageIndexDB.current = PAGEINDEX;

    ccaRecordIDDB.current = '';
    ccaNameDB.current = '';

    setSession(null);
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const handleDetails = useCallback((content: CCASession) => {
    setSpecificCCAData(content);
  }, []);

  const generateActionButtonSession = useCallback(
    async (content: CCASession) => {
      const button: JSX.Element = (
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
    [handleDetails],
  );

  const includeActionButton = useCallback(
    async (content: { count: number; res: CCASession[]; }) => {
      if (content.res.length > 0 && content.count > 0) {
        for (let key = 0; key < content.res.length; key += 1) {
        
            const dataField: CCASession = content.res[key];

            const buttons = await generateActionButtonSession(dataField);
            dataField.action = buttons;
          
        }
        setData(content.res);

        if (content.count % pageSizeDB.current === 0) {
          setPageCount(Math.floor(content.count / pageSizeDB.current));
        } else {
          setPageCount(Math.floor(content.count / pageSizeDB.current) + 1);
        }
      } else {
        setData([]);
      }
    },
    [generateActionButtonSession],
  );

  const fetchAttendance = useCallback(async (id: string) => {
    if (checkerString(id)) {
      setSubmitButtonPressed(true);
      try {
        const rawResponse = await fetch('/api/ccaAttendance/member', {
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
          setAttendance(content.msg as string);
        }
      } catch (error) {
        console.error(error);
      }
      setSubmitButtonPressed(false);
    }
  }, []);

  const fetchSession = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/ccaSession/fetch', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id,
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

    await fetchSession(ccaRecordIDDB.current);

    setLoadingData(false);
  }, [fetchSession]);

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

  useEffect(() => {
    async function setupData(
      modalDataField: CCASession,
      userSessionField: Session | null,
    ) {
      if (modalDataField !== undefined && modalDataField !== null) {
        setSession(userSessionField);

        const ccaRecordField: string =
          checkerString(modalDataField.ccaID) ? modalDataField.ccaID : '';
        ccaRecordIDDB.current = ccaRecordField;

        const ccaNameField: string =
          modalDataField.ccaName !== undefined && checkerString(modalDataField.ccaName)
            ? modalDataField.ccaName
            : '';
        ccaNameDB.current = ccaNameField;
        setCCAName(ccaNameField);

        await fetchAttendance(ccaRecordField);
        await tableChange();
      }
    }

    if (modalData !== undefined && modalData !== null) {
      setData([]);
      setupData(modalData, userSession);
    }
  }, [modalData, userSession, tableChange, fetchAttendance]);

  const columns = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'dateStr',
      },
      {
        Header: 'Duration',
        accessor: 'time',
      },
      {
        Header: 'Action',
        accessor: 'action',
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
          <SessionModal
            isOpen={specificCCAData}
            onClose={() => setSpecificCCAData(null)}
            modalData={specificCCAData}
            leader={false}
            dataHandler={null}
            userSession={session}
          />

          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />

          {checkerString(ccaName) && (
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
                  {ccaName}
                </Text>
              </Box>
            </Stack>
          )}

          {checkerString(attendance) && (
            <Box>
              <Stack direction='row'>
                <Text
                  textTransform='uppercase'
                  fontWeight='bold'
                  letterSpacing='tight'
                  color='gray.900'
                >
                  Attendance
                </Text>
                <Text>{attendance}</Text>
              </Stack>
            </Box>
          )}

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
