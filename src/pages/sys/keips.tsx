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
import { KEIPS } from 'types/misc/keips';

export default function KEIPSComponent() {
  const [loadingData, setLoadingData] = useState(true);
  const [successData, setSuccessData] = useState(false);

  const [matnet, setMATNET] = useState('');
  const matnetDB = useRef('');
  const [errorMsg, setError] = useState('');

  const [data, setData] = useState<KEIPS[]>([]);

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

  const includeActionButton = useCallback(async (content: KEIPS[]) => {
    if (content.length > 0) {
      for (let key = 0; key < content.length; key += 1) {
        if (content[key]) {
          // const dataField: KEIPS = content[key];
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
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack spacing={8} mx='auto' maxW='lg' py={12} px={6}>
        <Stack align='center'>
          <Heading fontSize='4xl'>KEVII</Heading>
          <Text>Work in progress...</Text>
        </Stack>

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
          <Box w='full' overflow='auto'>
            <Stack align='center' justify='center' spacing={30}>
              <TableWidget
                key={1}
                columns={columns}
                data={data}
                controlledPageCount={pageCount}
                dataHandler={null}
              />
            </Stack>
          </Box>
        )}
      </Stack>
    </Flex>
  );
}
