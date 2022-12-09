import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { KEIPS, KEIPSCCA, KEIPSBonus } from 'types/misc/keips';
import TableWidget from '@components/sys/misc/TableWidget';

import { checkerString } from '@constants/sys/helper';

/**
 * Renders a modal that displays numerous tables on KEIPS for a specified user
 *
 * @param param0 Modal functions and data
 * @returns A modal
 */
export default function KEIPSModal({ isOpen, onClose, modalData }) {
  const [loadingData, setLoadingData] = useState(true);
  const [successData, setSuccessData] = useState(false);
  const [matnet, setMATNET] = useState('');

  const [data, setData] = useState<KEIPS[]>([]);
  const [topCCA, setTopCCA] = useState<KEIPSCCA[]>([]);
  const [allCCA, setAllCCA] = useState<KEIPSCCA[]>([]);
  const [bonusCCA, setBonusCCA] = useState<KEIPSBonus[]>([]);

  const [showTop, setShowTop] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showBonus, setShowBonus] = useState(false);

  const PAGESIZE: number = 10;

  const [pageCount, setPageCount] = useState(0);
  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const reset = useCallback(() => {
    setLoadingData(true);
    setSuccessData(false);

    setMATNET('');
    setData([]);
    setTopCCA([]);
    setAllCCA([]);
    setBonusCCA([]);

    setShowTop(false);
    setShowAll(false);
    setShowAll(false);

    setPageCount(0);
    setSubmitButtonPressed(false);
  }, []);

  const handleModalCloseButton = useCallback(() => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  }, [onClose, reset]);

  const populateBonusCCA = useCallback(async (dataField: string[]) => {
    if (dataField.length > 0) {
      const totalData: KEIPSBonus[] = [];

      for (let key = 0; key < dataField.length; key += 1) {
        const dataF: string = dataField[key];
        const dataArr: string[] = dataF.split('.');

        if (dataArr.length > 2) {
          const parsedData: KEIPSBonus = {
            cca: dataArr[0],
            description: dataArr[1],
            total: Number(dataArr[2]),
          };

          totalData.push(parsedData);
        }
      }

      if (totalData.length > 0) {
        setBonusCCA(totalData);
        setShowBonus(true);
      }
    }
  }, []);

  const populateAllCCA = useCallback(async (dataField: string[]) => {
    if (dataField.length > 0) {
      const totalData: KEIPSCCA[] = [];

      for (let key = 0; key < dataField.length; key += 1) {
        const dataF: string = dataField[key];
        const dataArr: string[] = dataF.split('.');

        if (dataArr.length > 5) {
          const parsedData: KEIPSCCA = {
            cca: dataArr[0],
            cat: dataArr[1],
            atte: Number(dataArr[2]),
            perf: Number(dataArr[3]),
            outs: Number(dataArr[4]),
            total: Number(dataArr[5]),
          };

          totalData.push(parsedData);
        }
      }

      if (totalData.length > 0) {
        setAllCCA(totalData);
        setShowAll(true);
      }
    }
  }, []);

  const populateTopCCA = useCallback(async (dataField: string[]) => {
    if (dataField.length > 0) {
      const totalData: KEIPSCCA[] = [];

      for (let key = 0; key < dataField.length; key += 1) {
        const dataF: string = dataField[key];
        const dataArr: string[] = dataF.split('.');

        if (dataArr.length > 5) {
          const parsedData: KEIPSCCA = {
            cca: dataArr[0],
            cat: dataArr[1],
            atte: Number(dataArr[2]),
            perf: Number(dataArr[3]),
            outs: Number(dataArr[4]),
            total: Number(dataArr[5]),
          };

          totalData.push(parsedData);
        }
      }

      if (totalData.length > 0) {
        setTopCCA(totalData);
        setShowTop(true);
      }
    }
  }, []);

  const includeActionButton = useCallback(
    async (record: KEIPS) => {
      if (record !== null && record !== undefined) {
        if (checkerString(record.topCCA)) {
          const recordTop: string[] = record.topCCA.split('|');
          await populateTopCCA(recordTop);
        }

        if (checkerString(record.allCCA)) {
          const recordAll: string[] = record.allCCA.split('|');
          await populateAllCCA(recordAll);
        }

        if (checkerString(record.bonusCCA)) {
          const recordBonus: string[] = record.bonusCCA.split('|');
          await populateBonusCCA(recordBonus);
        }

        setMATNET(record.matnet);

        const dataField: KEIPS[] = [];
        dataField.push(record);

        setData(dataField);

        if (dataField.length % PAGESIZE === 0) {
          setPageCount(Math.floor(dataField.length / PAGESIZE));
        } else {
          setPageCount(Math.floor(dataField.length / PAGESIZE) + 1);
        }

        setSuccessData(true);
      }
    },
    [populateTopCCA, populateAllCCA, populateBonusCCA],
  );

  useEffect(() => {
    async function setupData(modalDataField: KEIPS) {
      setLoadingData(true);
      setSubmitButtonPressed(true);

      await includeActionButton(modalDataField);

      setSubmitButtonPressed(false);
      setLoadingData(false);
    }

    if (modalData) {
      setupData(modalData);
    }
  }, [modalData, includeActionButton]);

  const columns = useMemo(
    () => [
      {
        Header: 'OSA Points',
        accessor: 'OSA',
      },
      {
        Header: 'OSA Percentile',
        accessor: 'osaPercentile',
      },
      {
        Header: 'Room Draw Points',
        accessor: 'roomDraw',
      },
      {
        Header: 'Contrasting',
        accessor: 'contrastingStr',
      },
      {
        Header: 'Semester Stayed',
        accessor: 'semesterStay',
      },
      {
        Header: 'Fullfilled Criteria?',
        accessor: 'fulfilledStr',
      },
    ],
    [],
  );

  const columnsData = useMemo(
    () => [
      {
        Header: 'CCA',
        accessor: 'cca',
      },
      {
        Header: 'Category',
        accessor: 'cat',
      },
      {
        Header: 'Attendance',
        accessor: 'atte',
      },
      {
        Header: 'Performance',
        accessor: 'perf',
      },
      {
        Header: 'Outstanding',
        accessor: 'outs',
      },
      {
        Header: 'Total',
        accessor: 'total',
      },
    ],
    [],
  );

  const columnsBonus = useMemo(
    () => [
      {
        Header: 'CCA',
        accessor: 'cca',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Total',
        accessor: 'total',
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

          {checkerString(matnet) && (
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
                  MATNET: {matnet}
                </Text>
              </Box>
            </Stack>
          )}

          {modalData && !loadingData && successData && (
            <Stack align='center'>
              <Box>
                <Stack spacing={30}>
                  {data.length > 0 && (
                    <Box w='900px' overflow='auto' key='box-overall'>
                      <Stack align='center' justify='center' spacing={10}>
                        <TableWidget
                          id='overall-modal-table'
                          columns={columns}
                          data={data}
                          controlledPageCount={pageCount}
                          dataHandler={null}
                          showPage={false}
                        />
                      </Stack>
                    </Box>
                  )}

                  {showTop && topCCA.length > 0 && (
                    <Box w='900px' overflow='auto' key='box-top'>
                      <Stack align='center' justify='center'>
                        <Text>Top CCAs</Text>
                        <TableWidget
                          id='topcca-modal-table'
                          columns={columnsData}
                          data={topCCA}
                          controlledPageCount={pageCount}
                          dataHandler={null}
                          showPage={false}
                        />
                      </Stack>
                    </Box>
                  )}

                  {showAll && allCCA.length > 0 && (
                    <Box w='900px' overflow='auto' key='box-all'>
                      <Stack align='center' justify='center'>
                        <Text>All CCAs</Text>
                        <TableWidget
                          id='allcca-modal-table'
                          columns={columnsData}
                          data={allCCA}
                          controlledPageCount={pageCount}
                          dataHandler={null}
                          showPage={false}
                        />
                      </Stack>
                    </Box>
                  )}

                  {showBonus && bonusCCA.length > 0 && (
                    <Box w='900px' overflow='auto' key='box-bonus'>
                      <Stack align='center' justify='center'>
                        <Text>Bonus</Text>
                        <TableWidget
                          id='bonus-modal-table'
                          columns={columnsBonus}
                          data={bonusCCA}
                          controlledPageCount={pageCount}
                          dataHandler={null}
                          showPage={false}
                        />
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            bg='cyan.700'
            color='white'
            w='150px'
            size='lg'
            onClick={handleModalCloseButton}
            _hover={{ bg: 'cyan.800' }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
