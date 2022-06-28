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
  SimpleGrid,
  Stack,
  Select,
  Text,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { parentVariant } from '@root/motion';

import { checkerString } from '@constants/sys/helper';
import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/vbs/LoadingModal';

import { Result } from 'types/api';
import { CCARecord } from 'types/cca/ccaRecord';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const choice = {
  MEMBER: 1,
  SESSION: 2,
};

export default function LeaderModalComponent({ isOpen, onClose, modalData }) {
  const [specificMemberData, setSpecificMemberData] =
    useState<CCARecord | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const ccaRecordIDDB = useRef('');
  const [ccaName, setCCAName] = useState(null);

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

  const reset = () => {
    setSelectedChoice(0);
    setData([]);
    setCCAName(null);

    ccaRecordIDDB.current = '';
    selectionChoiceDB.current = 0;
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const handleDetails = useCallback(
    (content: CCARecord) => {
      setSpecificMemberData(content);
      console.log(specificMemberData);
    },
    [specificMemberData],
  );

  const generateActionButton = useCallback(
    async (content: CCARecord, action: number) => {
      switch (action) {
        case choice.MEMBER: {
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
        }
        case choice.SESSION:
          return null;
        default:
          return null;
      }
    },
    [submitButtonPressed, handleDetails],
  );

  const includeActionButton = useCallback(
    async (content: CCARecord[], action: number) => {
      if (content !== []) {
        for (let key = 0; key < content.length; key += 1) {
          if (content[key]) {
            const dataField: CCARecord = content[key];
            const buttons = await generateActionButton(dataField, action);
            dataField.action = buttons;
          }
        }
        setData(content);
        setPageCount(Math.floor(content.length / pageSizeDB.current) + 1);
      }
    },
    [generateActionButton],
  );

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

        setSubmitButtonPressed(false);
        return true;
      }
      return false;
    },
    [includeActionButton],
  );

  const fetchMembers = useCallback(
    async (id: string) => {
      if (checkerString(id)) {
        setSubmitButtonPressed(true);
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

        setSubmitButtonPressed(false);
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

  useEffect(() => {
    async function setupData() {
      if (modalData) {
        setCCAName(modalData.ccaName);
        ccaRecordIDDB.current = modalData.ccaID;

        await buildDropDownMenu();
      }
    }

    if (modalData) {
      setData([]);
      setupData();
    }
  }, [modalData, buildDropDownMenu]);

  const columnsSession = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
      },
      {
        Header: 'Duration',
        accessor: 'duration',
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
            columns={{ base: 1, md: 1, lg: 2, xl: 2 }}
            minChildWidth={{ base: 'full', md: '200px', lg: '400px' }}
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
                <Button
                  bg='cyan.700'
                  color='white'
                  w='150px'
                  size='lg'
                  _hover={{ bg: 'cyan.800' }}
                >
                  Add Session
                </Button>
              </Flex>
            </MotionBox>
          </MotionSimpleGrid>

          {!loadingData && data.length > 0 && selectedChoice === choice.MEMBER && (
            <Box overflow='auto'>
              <TableWidget
                key='table-widget-member'
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
              <Box overflow='auto'>
                <TableWidget
                  key='table-widget-session'
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
