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
import { cardVariant, parentVariant } from '@root/motion';
import { checkerString } from '@constants/sys/helper';
import TableWidget from '@components/sys/misc/TableWidget';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const choice = {
  MEMBER: 1,
  SESSION: 2,
};

export default function LeaderModalComponent({ isOpen, onClose, modalData }) {
  const ccaRecordIDDB = useRef('');
  const [ccaName, setCCAName] = useState(null);

  const [selectionDropDown, setSelectedDropDown] = useState<JSX.Element[]>([]);
  const [selectedChoice, setSelectedChoice] = useState('');

  const [data, setData] = useState([]);

  const pageSize = 10;

  const reset = () => {};

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const onSelectionChange = (event: { target: { value: string } }) => {
    if (event.target.value && checkerString(event.target.value)) {
      const choiceSelection: string = event.target.value;
      setSelectedChoice(choiceSelection);
    }
  };

  const buildDropDownMenu = useCallback(async () => {
    const selection: JSX.Element[] = [];

    selection.push(<option key='' value='' aria-label='default' />);

    selection.push(
      <option key='member-view' value={choice.MEMBER}>
        MEMBER VIEW
      </option>,
    );

    selection.push(
      <option key='session-view' value={choice.SESSION}>
        SESSION VIEW
      </option>,
    );

    setSelectedDropDown(selection);
  }, [modalData]);

  useEffect(() => {
    async function setupData() {
      if (modalData) {
        setCCAName(modalData.ccaName);
        ccaRecordIDDB.current = modalData.id;

        await buildDropDownMenu();
      }
    }

    if (modalData) {
      setData([]);
      setupData();
    }
  }, [buildDropDownMenu]);

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
            <MotionBox variants={cardVariant} key='selection-menu'>
              {modalData && (
                <Flex
                  w='full'
                  h='full'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Stack spacing={5} w='full' align='center'>
                    <Select
                      onChange={onSelectionChange}
                      size='sm'
                      value={selectedChoice}
                    >
                      {selectionDropDown}
                    </Select>
                  </Stack>
                </Flex>
              )}
            </MotionBox>

            <MotionBox variants={cardVariant} key='selection-menu'>
              {modalData && (
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
              )}
            </MotionBox>
          </MotionSimpleGrid>

          {data.length > 0 && (
            <Box overflow='auto'>
              <Text
                fontSize={{ base: '16px', lg: '18px' }}
                fontWeight='500'
                textTransform='uppercase'
                mb='4'
              >
                Conflicting Requests
              </Text>
              <TableWidget
                key={2}
                columns={columns}
                data={data}
                controlledPageCount={
                  data && data.length
                    ? Math.floor(data.length / pageSize + 1)
                    : 0
                }
                dataHandler={null}
              />
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
