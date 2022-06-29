import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import {
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
import { checkerString } from '@constants/sys/helper';
import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/vbs/LoadingModal';

import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';

export default function LeaderStudentModalComponent({
  isOpen,
  onClose,
  modalData,
}) {
  const [loadingData, setLoadingData] = useState(true);

  const [sessionUserName, setSessionUserName] = useState('');
  const [sessionUserStudentID, setSessionUserStudentID] = useState('');

  const [data, setData] = useState<CCARecord[]>([]);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const ccaRecordIDDB = useRef('');
  const sessionEmailDB = useRef('');

  const reset = () => {
    setData([]);
    setSessionUserName('');
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const includeActionButton = useCallback(async (content: CCARecord[]) => {
    if (content !== []) {
      for (let key = 0; key < content.length; key += 1) {
        if (content[key]) {
          // const dataField: CCARecord = content[key];
        }
      }
      setData(content);
      setPageCount(Math.floor(content.length / pageSizeDB.current) + 1);
    }
  }, []);

  const fetchMemberSession = useCallback(
    async (ccaID: string, userEmail: string) => {
      if (checkerString(ccaID) && checkerString(userEmail)) {
        try {
          const rawResponse = await fetch('/api/ccaAttendance/member', {
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

          console.log(content);
        } catch (error) {
          console.error(error);
        }

        return true;
      }
      return false;
    },
    [includeActionButton],
  );

  const tableChange = useCallback(async () => {
    setSubmitButtonPressed(true);
    setLoadingData(true);

    await fetchMemberSession(ccaRecordIDDB.current, sessionEmailDB.current);

    setSubmitButtonPressed(false);
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

  useEffect(() => {
    async function setupData() {
      if (modalData) {
        const sessionUserNameField: string =
          modalData && modalData.sessionName ? modalData.sessionName : '';
        const sessionUserStudentIDField: string =
          modalData && modalData.sessionStudentID
            ? modalData.sessionStudentID
            : '';
        setSessionUserName(sessionUserNameField);
        setSessionUserStudentID(sessionUserStudentIDField);

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
            <Stack direction='row'>
              <Text
                textTransform='uppercase'
                fontWeight='bold'
                letterSpacing='tight'
                color='gray.900'
              >
                Student No.
              </Text>
              <Text>{sessionUserStudentID}</Text>
            </Stack>
          </Box>

          {!loadingData && data.length > 0 && (
            <Box overflow='auto'>
              <TableWidget
                key='table-widget-session'
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
