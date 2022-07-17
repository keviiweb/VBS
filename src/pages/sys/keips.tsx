import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import LoadingModal from '@components/sys/misc/LoadingModal';
import TableWidget from '@components/sys/misc/TableWidget';

import { checkerString } from '@constants/sys/helper';
import { Result } from 'types/api';
import { KEIPS, KEIPSCCA, KEIPSBonus } from 'types/misc/keips';

export default function KEIPSComponent() {
  const [loadingData, setLoadingData] = useState(true);
  const [successData, setSuccessData] = useState(false);

  const [matnet, setMATNET] = useState('');
  const matnetDB = useRef('');
  const [errorMsg, setError] = useState('');

  const [data, setData] = useState<KEIPS[]>([]);
  const [topCCA, setTopCCA] = useState<KEIPSCCA[]>([]);
  const [allCCA, setAllCCA] = useState<KEIPSCCA[]>([]);
  const [bonusCCA, setBonusCCA] = useState<KEIPSBonus[]>([]);

  const [showTop, setShowTop] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showBonus, setShowBonus] = useState(false);

  const PAGESIZE: number = 10;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const validateField = (matnetField: string): boolean => {
    const userKeyRegExp = /[0-9]{3}[A-Z]{1}[0-9]{4}/;

    if (userKeyRegExp.test(matnetField) && matnetField.length === 8) {
      return true;
    }
    setError('MATNET not of the correct format');

    return false;
  };

  const populateBonusCCA = async (dataField: string[]) => {
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

      setBonusCCA(totalData);
      setShowBonus(true);
    }
  };

  const populateAllCCA = async (dataField: string[]) => {
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

      setAllCCA(totalData);
      setShowAll(true);
    }
  };

  const populateTopCCA = async (dataField: string[]) => {
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

      setTopCCA(totalData);
      setShowTop(true);
    }
  };

  const includeActionButton = useCallback(async (content: KEIPS[]) => {
    if (content.length > 0) {
      for (let key = 0; key < content.length; key += 1) {
        if (content[key]) {
          const record: KEIPS = content[key];

          const recordTop: string[] = record.topCCA.split('|');
          const recordAll: string[] = record.allCCA.split('|');
          const recordBonus: string[] = record.bonusCCA.split('|');

          await populateTopCCA(recordTop);
          await populateAllCCA(recordAll);
          await populateBonusCCA(recordBonus);
        }
      }
      setData(content);

      if (content.length % pageSizeDB.current === 0) {
        setPageCount(Math.floor(content.length / pageSizeDB.current));
      } else {
        setPageCount(Math.floor(content.length / pageSizeDB.current) + 1);
      }

      setSuccessData(true);
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: { preventDefault: () => void }) => {
      event.preventDefault();
      if (checkerString(matnetDB.current) && validateField(matnetDB.current)) {
        setError('');
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/keips/fetch', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              matnet: matnetDB.current,
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
        setLoadingData(false);
        return true;
      }
      setError('Please enter a valid MATNET');
      return false;
    },
    [includeActionButton],
  );

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
        Header: 'Semester stayed',
        accessor: 'semesterStay',
      },
      {
        Header: 'Fullfilled criteria?',
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
    <Flex minH='100vh' w='full' align='center' justify='center' bg='gray.50'>
      <Stack align='center' spacing={8} mx='auto' maxW='lg' py={12} px={6}>
        {!successData && (
          <Stack align='center'>
            <Heading fontSize='4xl'>KEVII</Heading>
            <Text>Work in progress...</Text>
          </Stack>
        )}

        <LoadingModal
          isOpen={!!submitButtonPressed}
          onClose={() => setSubmitButtonPressed(false)}
        />

        {checkerString(errorMsg) && (
          <Stack align='center'>
            <Text>{errorMsg}</Text>
          </Stack>
        )}

        {!successData && (
          <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id='email'>
                  <FormLabel>Key in your MATNET (e.g. 666X9999)</FormLabel>
                  <Input
                    type='text'
                    placeholder='MATNET'
                    size='lg'
                    value={matnet}
                    onChange={(event) => {
                      setSuccessData(false);
                      setLoadingData(true);
                      setMATNET(event.currentTarget.value);
                      matnetDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>
                <Stack spacing={10}>
                  <Button
                    type='submit'
                    bg='blue.400'
                    color='white'
                    _hover={{
                      bg: 'blue.500',
                    }}
                  >
                    Submit
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        )}

        {!loadingData && !successData && data && data.length === 0 && (
          <Box mt={30}>
            <Stack align='center' justify='center'>
              <Text>MATNET {matnet} is not in our database.</Text>
            </Stack>
          </Box>
        )}

        {!loadingData && successData && data && data !== [] && data.length > 0 && (
          <Box>
            <Stack spacing={30}>
              <Box w='900px' overflow='auto'>
                <Stack align='center' justify='center' spacing={10}>
                  <Text>MATNET: {matnet}</Text>
                  <TableWidget
                    key={1}
                    columns={columns}
                    data={data}
                    controlledPageCount={pageCount}
                    dataHandler={null}
                    showPage={false}
                  />
                </Stack>
              </Box>

              {showTop && topCCA.length > 0 && (
                <Box w='900px' overflow='auto'>
                  <Stack align='center' justify='center'>
                    <Text>Top CCAs</Text>
                    <TableWidget
                      key={2}
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
                <Box w='900px' overflow='auto'>
                  <Stack align='center' justify='center'>
                    <Text>All CCAs</Text>
                    <TableWidget
                      key={3}
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
                <Box w='900px' overflow='auto'>
                  <Stack align='center' justify='center'>
                    <Text>Bonus</Text>
                    <TableWidget
                      key={4}
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
        )}
      </Stack>
    </Flex>
  );
}
