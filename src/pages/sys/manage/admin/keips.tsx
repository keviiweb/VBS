import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Button,
  Box,
  chakra,
  FormControl,
  FormLabel,
  Flex,
  Heading,
  Icon,
  Text,
  SimpleGrid,
  Stack,
  useToast,
  VisuallyHidden,
} from '@chakra-ui/react';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import Auth from '@components/sys/Auth';
import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/misc/LoadingModal';
import KEIPSModal from '@components/sys/misc/KEIPSModal';

import { checkerString } from '@constants/sys/helper';

import { KEIPS } from 'types/misc/keips';
import { Result } from 'types/api';
import { levels } from '@root/src/constants/sys/admin';

import { Session } from 'next-auth/core/types';

import { GetServerSideProps } from 'next';
import { currentSession } from '@root/src/helper/sys/sessionServer';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * In this file, MATNET is defined as
 * <last 4 digit of Student ID><last 4 digit of NUSNET ID>
 *
 * eg. Student ID: A1234567R, NUSNET: E0011232
 * eg. 567R1232
 */

/**
 * Renders a component that displays the list of KEIPS points available
 *
 * Creating and Editing a KEIPS record is an OWNER-level task only
 *
 * @param props Permission level of user
 * @returns Manage KEIPS page
 */
export default function ManageKEIPS(props: any) {
  const [modalData, setModalData] = useState<KEIPS | null>(null);
  const toast = useToast();

  const [level, setLevel] = useState(levels.USER);

  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<KEIPS[]>([]);

  const [errorMsgFileKEIPS, setErrorFileKEIPS] = useState('');

  let fetchData: any;

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const selectedFileKEIPSDB = useRef<string | Blob | null>(null);
  const [fileNameKEIPS, setFileNameKEIPS] = useState(null);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const resetFileKEIPS = useCallback(async () => {
    selectedFileKEIPSDB.current = null;
    setFileNameKEIPS(null);
  }, []);

  const handleDetails = useCallback((content: KEIPS) => {
    setModalData(content);
  }, []);

  const handleSubmitFileKEIPS = useCallback(
    async (event: { preventDefault: () => void }) => {
      setErrorFileKEIPS('');
      event.preventDefault();
      if (selectedFileKEIPSDB.current !== null) {
        setSubmitButtonPressed(true);
        try {
          const dataField = new FormData();
          dataField.append('file', selectedFileKEIPSDB.current);

          const rawResponse = await fetch('/api/keips/file', {
            method: 'POST',
            body: dataField,
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            toast({
              title: 'KEIPS Populated.',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });

            await resetFileKEIPS();
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
        setSubmitButtonPressed(false);
      } else {
        setErrorFileKEIPS('Please upload a file');
      }

      return false;
    },
    [fetchData, resetFileKEIPS, toast],
  );

  const generateActionButton = useCallback(
    async (content: KEIPS) => {
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
    async (content: { count: number; res: KEIPS[] }) => {
      if (
        (content.count !== undefined || content.count !== null) &&
        (content.res !== undefined || content.res !== null)
      ) {
        const contentRes: KEIPS[] = content.res;

        for (let key = 0; key < contentRes.length; key += 1) {
          if (contentRes[key]) {
            const dataField: KEIPS = contentRes[key];
            const buttons = await generateActionButton(dataField);
            dataField.action = buttons;
          }
        }

        setData(contentRes);

        if (content.count % pageSizeDB.current === 0) {
          setPageCount(Math.floor(content.count / pageSizeDB.current));
        } else {
          setPageCount(Math.floor(content.count / pageSizeDB.current) + 1);
        }
      }
    },
    [generateActionButton],
  );

  const fetchDataTable = useCallback(async () => {
    setSubmitButtonPressed(true);
    try {
      const rawResponse = await fetch(
        `/api/keips/all?limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
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
    setSubmitButtonPressed(false);
  }, [includeActionButton]);

  fetchData = useCallback(async () => {
    setLoadingData(true);
    setData([]);

    await fetchDataTable();
    setLoadingData(false);
  }, [fetchDataTable]);

  const onFileChangeKEIPS = async (event: {
    target: { files: any[] | any };
  }) => {
    setErrorFileKEIPS('');
    try {
      const file = event.target.files[0];
      if (file !== undefined && file !== null && file.name !== undefined) {
        selectedFileKEIPSDB.current = file;
        setFileNameKEIPS(file.name);
      } else {
        setErrorFileKEIPS('File name not found');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    async function generate(propsField: any) {
      setLevel(propsField.data);

      await fetchData();
    }

    generate(props);
  }, [fetchData, props]);

  const columns = useMemo(
    () => [
      {
        Header: 'MATNET',
        accessor: 'matnet',
      },
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
      {
        Header: 'Actions',
        accessor: 'action',
      },
    ],
    [],
  );

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

  return (
    <Auth admin>
      <Box
        bg='white'
        borderRadius='lg'
        p={8}
        color='gray.700'
        shadow='base'
        overflow='auto'
      >
        <LoadingModal
          isOpen={!!submitButtonPressed}
          onClose={() => setSubmitButtonPressed(false)}
        />
        <MotionBox variants={cardVariant} key='1'>
          {loadingData && !data && <Text>Loading Please wait...</Text>}

          {!loadingData && data && data.length === 0 && (
            <Box mt={30}>
              <Stack align='center' justify='center'>
                <Text>No KEIPS found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data && data.length > 0 && (
            <Box w='full' overflow='auto'>
              <Stack spacing={30} align='center' justify='center'>
                <TableWidget
                  key={1}
                  columns={columns}
                  data={data}
                  controlledPageCount={pageCount}
                  dataHandler={onTableChange}
                />
              </Stack>

              <KEIPSModal
                isOpen={modalData}
                onClose={() => setModalData(null)}
                modalData={modalData}
              />
            </Box>
          )}
        </MotionBox>
      </Box>

      <MotionSimpleGrid
        mt='3'
        minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
        minH='full'
        variants={parentVariant}
        initial='initial'
        animate='animate'
      >
        {level === levels.OWNER && (
          <MotionBox key='populate-keips'>
            <Stack
              spacing={4}
              w='full'
              maxW='md'
              bg='white'
              rounded='xl'
              boxShadow='lg'
              p={6}
              my={12}
            >
              <Heading size='md'>Populate KEIPS Records</Heading>
              <form onSubmit={handleSubmitFileKEIPS}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize='sm' fontWeight='md' color='gray.700'>
                      CSV File
                    </FormLabel>
                    {fileNameKEIPS && (
                      <Text>File uploaded: {fileNameKEIPS}</Text>
                    )}
                    <Flex
                      mt={1}
                      justify='center'
                      px={6}
                      pt={5}
                      pb={6}
                      borderWidth={2}
                      borderColor='gray.300'
                      borderStyle='dashed'
                      rounded='md'
                    >
                      <Stack spacing={1} textAlign='center'>
                        <Icon
                          mx='auto'
                          boxSize={12}
                          color='gray.400'
                          stroke='currentColor'
                          fill='none'
                          viewBox='0 0 48 48'
                          aria-hidden='true'
                        />
                        <Flex
                          fontSize='sm'
                          color='gray.600'
                          alignItems='baseline'
                        >
                          <chakra.label
                            htmlFor='file-upload-keips'
                            cursor='pointer'
                            rounded='md'
                            fontSize='md'
                            color='brand.600'
                            pos='relative'
                            _hover={{
                              color: 'brand.400',
                            }}
                          >
                            <span>Upload a file</span>
                            <VisuallyHidden>
                              <input
                                id='file-upload-keips'
                                name='file-upload-keips'
                                type='file'
                                accept='.csv'
                                onChange={onFileChangeKEIPS}
                              />
                            </VisuallyHidden>
                          </chakra.label>
                        </Flex>
                        <Text fontSize='xs' color='gray.500'>
                          CSV up to 10MB
                        </Text>
                      </Stack>
                    </Flex>
                  </FormControl>

                  {checkerString(errorMsgFileKEIPS) && (
                    <Stack align='center'>
                      <Text>{errorMsgFileKEIPS}</Text>
                    </Stack>
                  )}

                  <Stack spacing={10}>
                    <Button
                      type='submit'
                      bg='blue.400'
                      color='white'
                      disabled={submitButtonPressed}
                      _hover={{
                        bg: 'blue.500',
                      }}
                    >
                      Populate
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Stack>
          </MotionBox>
        )}
      </MotionSimpleGrid>
    </Auth>
  );
}

export const getServerSideProps: GetServerSideProps = async (cont) => {
  cont.res.setHeader(
    'Cache-Control',
    'public, s-maxage=120, stale-while-revalidate=240',
  );

  let data: number = levels.USER;
  try {
    const session: Session | null = await currentSession(null, null, cont);
    if (session !== null) {
      data = session.user.admin;
    }
  } catch (error) {
    console.error(error);
  }

  return {
    props: {
      data: data,
    },
  };
};
