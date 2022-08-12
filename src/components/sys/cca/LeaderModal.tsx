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
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverContent,
  SimpleGrid,
  StackDirection,
  Stack,
  Select,
  Text,
  usePopoverContext,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  DeleteIcon,
  EditIcon,
  InfoOutlineIcon,
} from '@chakra-ui/icons';
import { parentVariant } from '@root/motion';

import { checkerString } from '@constants/sys/helper';
import { convertDateToUnix } from '@constants/sys/date';

import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/misc/LoadingModal';
import LeaderStudentModalComponent from '@components/sys/cca/LeaderStudentModal';
import SessionModal from '@components/sys/cca/SessionModal';
import SessionEditModal from '@components/sys/cca/SessionEditModal';
import SessionDeleteConfirmationModal from '@components/sys/cca/SessionDeleteConfirmationModal';
import SessionCreateModal from '@components/sys/cca/SessionCreateModal';

import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';
import { PopoverTriggerProps } from 'types/popover';
import { CCASession } from 'types/cca/ccaSession';
import { CCAAttendance } from 'types/cca/ccaAttendance';

import moment from 'moment';
import { CSVLink } from 'react-csv';

import hasPermission from '@constants/sys/permission';
import { actions } from '@constants/sys/admin';
import { Session } from 'next-auth/core/types';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const choice = {
  MEMBER: 1,
  SESSION: 2,
};

const PopoverTriggerNew: React.FC<
  React.PropsWithChildren<PopoverTriggerProps>
> = (props) => {
  // enforce a single child
  const child: any = React.Children.only(props.children);
  const { getTriggerProps } = usePopoverContext();
  return React.cloneElement(child, getTriggerProps(child.props, child.ref));
};

/**
 * Renders the modal that is displayed for the CCA leader.
 *
 * The leader can see all sessions, and members of the CCA, as well as perform operations such as
 * deleting, creating an editing session.
 *
 * @param param0 Modal function and data
 * @returns
 */
export default function LeaderModalComponent({
  isOpen,
  onClose,
  calendarThreshold,
  modalData,
  userSession,
}) {
  const [specificMemberData, setSpecificMemberData] =
    useState<CCARecord | null>(null);
  const [specificCCAData, setSpecificCCAData] = useState<CCASession | null>(
    null,
  );

  const [specificSession, setSpecificSessionData] = useState<CCASession | null>(
    null,
  );

  const [sessionCreate, setSessionCreateData] = useState<CCASession | null>(
    null,
  );

  const [specificSessionDelete, setSpecificSessionDeleteData] =
    useState<CCASession | null>(null);

  const [loadingData, setLoadingData] = useState(true);

  const ccaRecordIDDB = useRef('');
  const [ccaName, setCCAName] = useState('');

  const [selectionDropDown, setSelectedDropDown] = useState<JSX.Element[]>([]);
  const [selectedChoice, setSelectedChoice] = useState(0);
  const selectionChoiceDB = useRef(0);

  const [data, setData] = useState<CCARecord[]>([]);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const [downloadCSV, setDownloadCSV] = useState(false);

  const CSVheaders = [
    { label: 'Session Name', key: 'sessionName' },
    { label: 'CCA Name', key: 'ccaName' },
    { label: 'Date', key: 'dateStr' },
    { label: 'Time', key: 'time' },
    { label: 'Email', key: 'sessionEmail' },
    { label: 'Attendance', key: 'ccaAttendance' },
  ];

  const [CSVdata, setCSVdata] = useState<CCAAttendance[]>([]);

  const CSVheadersSession = [
    { label: 'Session Name', key: 'name' },
    { label: 'CCA Name', key: 'ccaName' },
    { label: 'Date', key: 'dateStr' },
    { label: 'Time', key: 'time' },
    { label: 'Duration', key: 'duration' },
    { label: 'Editable', key: 'editableStr' },
    { label: 'Optional', key: 'optionalStr' },
    { label: 'Remarks', key: 'remarks' },
    { label: 'Leader Notes', key: 'ldrNotes' },
    { label: 'Expected Members', key: 'expectedMName' },
  ];

  const [CSVdataSession, setCSVdataSession] = useState<CCASession[]>([]);

  const [session, setSession] = useState<Session | null>(null);

  const variantButtons = useBreakpointValue({
    base: 'column' as StackDirection,
    lg: 'row' as StackDirection,
  });

  const currentDate = async (): Promise<string> => {
    const res = moment.tz(new Date(), 'Asia/Singapore').format('YYYY-MM-DD');
    return res;
  };

  const reset = () => {
    setSpecificMemberData(null);
    setSpecificCCAData(null);
    setSpecificSessionData(null);
    setSessionCreateData(null);
    setSpecificSessionDeleteData(null);

    setLoadingData(true);

    setCCAName('');
    setSelectedDropDown([]);
    setSelectedChoice(0);

    ccaRecordIDDB.current = '';
    selectionChoiceDB.current = 0;

    setData([]);
    setSubmitButtonPressed(false);

    setPageCount(0);
    pageSizeDB.current = PAGESIZE;
    pageIndexDB.current = PAGEINDEX;

    setDownloadCSV(false);
    setCSVdata([]);
    setCSVdataSession([]);

    setSession(null);
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const handleDetails = useCallback((content: CCARecord) => {
    setSpecificMemberData(content);
  }, []);

  const handleDetailsSession = useCallback((content: CCASession) => {
    setSpecificCCAData(content);
  }, []);

  const handleEditSession = useCallback((content: CCASession) => {
    setSpecificSessionData(content);
  }, []);

  const handleDeleteSession = useCallback((content: CCASession) => {
    setSpecificSessionDeleteData(content);
  }, []);

  const handleCreateSession = useCallback(async () => {
    if (checkerString(ccaRecordIDDB.current)) {
      const curr: string = await currentDate();
      const dateN: number = convertDateToUnix(curr);
      const sess: CCASession = {
        ccaID: ccaRecordIDDB.current,
        name: '',
        date: dateN,
        dateStr: curr,
        time: '',
      };
      setSessionCreateData(sess);
    }
  }, []);

  const handleFetchAttendance = useCallback(async () => {
    if (checkerString(ccaRecordIDDB.current)) {
      setSubmitButtonPressed(true);

      try {
        const rawResponse = await fetch('/api/ccaAttendance/file', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ccaID: ccaRecordIDDB.current,
          }),
        });

        const content: Result = await rawResponse.json();
        if (content.status) {
          const attendanceData: CCAAttendance[] = content.msg;
          if (attendanceData.length > 0) {
            setCSVdata(attendanceData);
          }
        }
      } catch (error) {
        console.error(error);
      }

      setSubmitButtonPressed(false);
    }
  }, []);

  const generateActionButtonRecord = useCallback(
    async (content: CCARecord) => {
      const button: JSX.Element = (
        <Button
          size='sm'
          isDisabled={submitButtonPressed}
          leftIcon={<InfoOutlineIcon />}
          onClick={() => handleDetails(content)}
        >
          View Details
        </Button>
      );
      return button;
    },
    [submitButtonPressed, handleDetails],
  );

  const generateActionButtonSession = useCallback(
    async (content: CCASession) => {
      if (
        content.editable ||
        (session !== null &&
          hasPermission(session.user.admin, actions.OVERRIDE_EDIT_SESSION))
      ) {
        const button: JSX.Element = (
          <Popover>
            <PopoverTriggerNew>
              <Button
                key='option-sess'
                size='md'
                isDisabled={submitButtonPressed}
                leftIcon={<InfoOutlineIcon />}
              >
                Options
              </Button>
            </PopoverTriggerNew>
            <PopoverContent w='22vw' maxW='md'>
              <Button
                key='details-sess'
                py={5}
                size='md'
                isDisabled={submitButtonPressed}
                leftIcon={<BellIcon />}
                onClick={() => handleDetailsSession(content)}
              >
                Details
              </Button>
              <Button
                key='edit-sess'
                mt={1}
                py={5}
                size='md'
                isDisabled={submitButtonPressed}
                leftIcon={<EditIcon />}
                onClick={() => handleEditSession(content)}
              >
                Edit
              </Button>
              <Button
                key='delete-sess'
                py={5}
                mt={1}
                size='md'
                isDisabled={submitButtonPressed}
                leftIcon={<DeleteIcon />}
                onClick={() => handleDeleteSession(content)}
              >
                Delete
              </Button>
            </PopoverContent>
          </Popover>
        );

        return button;
      }
      const button: JSX.Element = (
        <Popover>
          <PopoverTriggerNew>
            <Button
              key='not-editable-session-button'
              size='md'
              isDisabled={submitButtonPressed}
              leftIcon={<InfoOutlineIcon />}
            >
              Options
            </Button>
          </PopoverTriggerNew>
          <PopoverContent w='22vw' maxW='md'>
            <Button
              key='not-editable-session'
              py={5}
              size='md'
              isDisabled={submitButtonPressed}
              leftIcon={<BellIcon />}
              onClick={() => handleDetailsSession(content)}
            >
              Details
            </Button>
          </PopoverContent>
        </Popover>
      );

      return button;
    },
    [
      submitButtonPressed,
      session,
      handleDetailsSession,
      handleEditSession,
      handleDeleteSession,
    ],
  );

  const includeActionButton = useCallback(
    async (
      content: { count: number; res: CCARecord[] | CCASession[] },
      action: number,
    ) => {
      if (content.res !== [] && content.count > 0) {
        for (let key = 0; key < content.res.length; key += 1) {
          if (content.res[key]) {
            switch (action) {
              case choice.MEMBER: {
                const dataField: CCARecord = content.res[key] as CCARecord;

                const buttons = await generateActionButtonRecord(dataField);
                dataField.action = buttons;
                break;
              }
              case choice.SESSION: {
                const dataField: CCASession = content.res[key] as CCASession;

                const buttons = await generateActionButtonSession(dataField);
                dataField.action = buttons;
                break;
              }
              default:
                break;
            }
          }
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
    [generateActionButtonRecord, generateActionButtonSession],
  );

  const fetchSession = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        try {
          const rawResponse = await fetch('/api/ccaSession/fetch', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: id,
              limit: pageSizeDB.current,
              skip: pageIndexDB.current,
            }),
          });
          const content: Result = await rawResponse.json();

          if (content.status) {
            await includeActionButton(content.msg, choice.SESSION);
          }
        } catch (error) {
          console.error(error);
        }

        return true;
      }
      return false;
    },
    [includeActionButton],
  );

  const fetchSessionOverall = useCallback(async (id: string) => {
    if (checkerString(id)) {
      try {
        const rawResponse = await fetch('/api/ccaSession/fetch', {
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
          const dataField: { count: number; res: CCASession[] } = content.msg;
          if (dataField.count > 0 && dataField.res.length > 0) {
            setCSVdataSession(dataField.res);
          }
        }
      } catch (error) {
        console.error(error);
      }

      return true;
    }
    return false;
  }, []);

  const fetchMembers = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        try {
          const rawResponse = await fetch('/api/ccaRecord/fetch', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: id,
              limit: pageSizeDB.current,
              skip: pageIndexDB.current,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            await includeActionButton(content.msg, choice.MEMBER);
          }
        } catch (error) {
          console.error(error);
        }

        return true;
      }
      return false;
    },
    [includeActionButton],
  );

  const tableChange = useCallback(
    async (index: number) => {
      setSubmitButtonPressed(true);
      setLoadingData(true);

      switch (index) {
        case choice.MEMBER:
          await fetchMembers(ccaRecordIDDB.current);
          break;
        case choice.SESSION:
          await fetchSession(ccaRecordIDDB.current);
          break;
        default:
          break;
      }

      setSubmitButtonPressed(false);
      setLoadingData(false);
    },
    [fetchMembers, fetchSession],
  );

  const successEditSession = useCallback(async () => {
    if (checkerString(ccaRecordIDDB.current)) {
      await fetchSession(ccaRecordIDDB.current);
    }
  }, [fetchSession]);

  const deleteSession = useCallback(
    async (sess: CCASession) => {
      if (sess !== null && sess !== undefined) {
        const { id } = sess;
        if (id !== undefined && checkerString(id)) {
          setSubmitButtonPressed(true);
          try {
            const rawResponse = await fetch('/api/ccaSession/delete', {
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
              await successEditSession();
            }
          } catch (error) {
            console.error(error);
          }
          setSubmitButtonPressed(false);
        }
      }
    },
    [successEditSession],
  );

  const onSelectionChange = async (event: { target: { value: string } }) => {
    if (event.target.value && checkerString(event.target.value)) {
      const choiceSelection: string = event.target.value;
      setSelectedChoice(Number(choiceSelection));

      await tableChange(Number(choiceSelection));
    }
  };

  const buildDropDownMenu = useCallback(async () => {
    const selection: JSX.Element[] = [];

    selection.push(<option key='default' value='' aria-label='default' />);

    selection.push(
      <option key='member' value={choice.MEMBER}>
        MEMBER VIEW
      </option>,
    );

    selection.push(
      <option key='session' value={choice.SESSION}>
        SESSION VIEW
      </option>,
    );

    setSelectedDropDown(selection);
  }, []);

  const onTableChange = useCallback(
    async ({ pageIndex, pageSize }) => {
      if (
        pageSize !== pageSizeDB.current ||
        pageIndex !== pageIndexDB.current
      ) {
        pageSizeDB.current = pageSize;
        pageIndexDB.current = pageIndex;

        await tableChange(selectionChoiceDB.current);
      }
    },
    [tableChange],
  );

  const handleDownload = useCallback(async () => {
    if (checkerString(ccaRecordIDDB.current)) {
      await handleFetchAttendance();
      await fetchSessionOverall(ccaRecordIDDB.current);

      setDownloadCSV(true);
    }
  }, [handleFetchAttendance, fetchSessionOverall]);

  useEffect(() => {
    async function setupData(userSessionField: Session | null) {
      if (modalData) {
        const ccaNameField: string =
          modalData && modalData.ccaName ? modalData.ccaName : '';
        setCCAName(ccaNameField);

        ccaRecordIDDB.current =
          modalData && modalData.ccaID ? modalData.ccaID : '';

        await buildDropDownMenu();

        setSession(userSessionField);
      }
    }

    if (modalData) {
      setData([]);
      setupData(userSession);
    }
  }, [modalData, userSession, buildDropDownMenu]);

  const columnsSession = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'dateStr',
      },
      {
        Header: 'Time',
        accessor: 'time',
      },
      {
        Header: 'Duration (Hours)',
        accessor: 'duration',
      },
      {
        Header: 'Optional',
        accessor: 'optionalStr',
      },
      {
        Header: 'Editable',
        accessor: 'editableStr',
      },
      {
        Header: 'Actions',
        accessor: 'action',
      },
    ],
    [],
  );

  const columnsMember = useMemo(
    () => [
      {
        Header: 'Member',
        accessor: 'sessionName',
      },
      {
        Header: 'Attendance Rate',
        accessor: 'rate',
      },
      {
        Header: 'Actions',
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
          <SessionCreateModal
            isOpen={sessionCreate}
            onClose={() => setSessionCreateData(null)}
            modalData={sessionCreate}
            threshold={calendarThreshold}
            dataHandler={successEditSession}
          />

          <SessionDeleteConfirmationModal
            isOpen={specificSessionDelete}
            onClose={() => setSpecificSessionDeleteData(null)}
            modalData={specificSessionDelete}
            dataHandler={deleteSession}
          />

          <SessionEditModal
            isOpen={specificSession}
            onClose={() => setSpecificSessionData(null)}
            modalData={specificSession}
            dataHandler={successEditSession}
            userSession={session}
          />

          <LeaderStudentModalComponent
            isOpen={specificMemberData}
            onClose={() => setSpecificMemberData(null)}
            modalData={specificMemberData}
          />

          <SessionModal
            isOpen={specificCCAData}
            onClose={() => setSpecificCCAData(null)}
            modalData={specificCCAData}
            leader
            dataHandler={successEditSession}
            userSession={session}
          />

          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />

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

          <MotionSimpleGrid
            columns={{ base: 1, md: 2, lg: 2, xl: 2 }}
            minChildWidth={{
              base: 'full',
              sm: 'full',
              md: '200px',
              lg: '400px',
            }}
            pos='relative'
            gap={{ base: 2, sm: 4 }}
            px={5}
            py={6}
            p={{ sm: 8 }}
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox key='selection-menu'>
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
              >
                <Stack spacing={5} w='full' align='left'>
                  <Text
                    textTransform='uppercase'
                    lineHeight='5'
                    fontWeight='bold'
                    letterSpacing='tight'
                    color='gray.900'
                  >
                    Select View
                  </Text>
                  <Select
                    onChange={onSelectionChange}
                    size='sm'
                    value={selectedChoice}
                  >
                    {selectionDropDown}
                  </Select>
                </Stack>
              </Flex>
            </MotionBox>

            <MotionBox key='add-session'>
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
              >
                <Stack direction={variantButtons} spacing={5}>
                  <Button
                    bg='cyan.700'
                    color='white'
                    w={{ base: 'full', md: '150px' }}
                    size='lg'
                    _hover={{ bg: 'cyan.800' }}
                    onClick={handleCreateSession}
                  >
                    Add Session
                  </Button>

                  {!downloadCSV && (
                    <Button
                      bg='gray.400'
                      color='white'
                      w={{ base: 'full', md: '150px' }}
                      size='lg'
                      _hover={{ bg: 'cyan.800' }}
                      onClick={handleDownload}
                    >
                      Download CSV
                    </Button>
                  )}

                  {downloadCSV && CSVdata.length > 0 && (
                    <Button
                      bg='gray.400'
                      color='white'
                      w={{ base: 'full', md: '180px' }}
                      size='lg'
                      _hover={{ bg: 'gray.600' }}
                    >
                      <CSVLink
                        data={CSVdata}
                        headers={CSVheaders}
                        filename={`${ccaName}.csv`}
                        target='_blank'
                      >
                        Export Attendance
                      </CSVLink>
                    </Button>
                  )}

                  {downloadCSV && CSVdataSession.length > 0 && (
                    <Button
                      bg='gray.400'
                      color='white'
                      w={{ base: 'full', md: '180px' }}
                      size='lg'
                      _hover={{ bg: 'gray.600' }}
                    >
                      <CSVLink
                        data={CSVdataSession}
                        headers={CSVheadersSession}
                        filename={`${ccaName}.csv`}
                        target='_blank'
                      >
                        Export Sessions
                      </CSVLink>
                    </Button>
                  )}
                </Stack>
              </Flex>
            </MotionBox>
          </MotionSimpleGrid>

          {!loadingData && data.length > 0 && selectedChoice === choice.MEMBER && (
            <Box w='full' overflow='auto'>
              <TableWidget
                id='table-widget-member'
                columns={columnsMember}
                data={data}
                controlledPageCount={pageCount}
                dataHandler={onTableChange}
              />
            </Box>
          )}

          {!loadingData &&
            data.length === 0 &&
            selectedChoice === choice.MEMBER && (
              <Box mt={30}>
                <Stack align='center' justify='center'>
                  <Text>No members found</Text>
                </Stack>
              </Box>
          )}

          {!loadingData &&
            data.length > 0 &&
            selectedChoice === choice.SESSION && (
              <Box w='full' overflow='auto'>
                <TableWidget
                  id='table-widget-session'
                  columns={columnsSession}
                  data={data}
                  controlledPageCount={pageCount}
                  dataHandler={onTableChange}
                />
              </Box>
          )}

          {!loadingData &&
            data.length === 0 &&
            selectedChoice === choice.SESSION && (
              <Box mt={30}>
                <Stack align='center' justify='center'>
                  <Text>No session found</Text>
                </Stack>
              </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
