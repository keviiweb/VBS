import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} from 'react';
import {
  Button,
  Box,
  chakra,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Icon,
  Text,
  SimpleGrid,
  Stack,
  Select,
  useToast,
  VisuallyHidden
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

import Auth from '@components/sys/Auth';
import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/misc/LoadingModal';

import { checkerString } from '@constants/sys/helper';

import { Result } from 'types/api';
import { Announcement } from 'types/misc/announcement';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Renders a page that allows users to add new announcements
 *
 * @returns Manage Announcement Page
 */
export default function ManageAnnouncement () {
  const toast = useToast();
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<Announcement[]>([]);

  const [description, setDescription] = useState('');
  const descriptionDB = useRef('');

  const selectedFileDB = useRef<string | Blob | null>(null);
  const [fileName, setFileName] = useState(null);

  const [errorMsg, setError] = useState('');

  const [descriptionEdit, setDescriptionEdit] = useState('');
  const descriptionDBEdit = useRef('');

  const [announceDropdown, setAnnounceDropdown] = useState<JSX.Element[]>([]);
  const [announceIDEdit, setAnnounceIDEdit] = useState('');
  const announceIDDBEdit = useRef('');

  const [errorEdit, setErrorEdit] = useState('');

  const announceData = useRef<Announcement[]>([]);

  let generateActionButton: any;
  let fetchData: any;
  let resetEdit: any;

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const handleDelete = useCallback(async () => {
    setErrorEdit('');
    if (checkerString(announceIDDBEdit.current)) {
      setSubmitButtonPressed(true);

      const dataField = new FormData();
      dataField.append('id', announceIDDBEdit.current);

      try {
        const rawResponse = await fetch('/api/announcement/delete', {
          method: 'POST',
          body: dataField
        });
        const content: Result = await rawResponse.json();
        if (content.status) {
          await resetEdit();
          toast({
            title: 'Success',
            description: content.msg,
            status: 'success',
            duration: 5000,
            isClosable: true
          });

          await fetchData();
        } else {
          toast({
            title: 'Error',
            description: content.error,
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      } catch (error) {
        console.error(error);
      }

      setSubmitButtonPressed(false);
    }
  }, [fetchData, resetEdit, toast]);

  const reset = useCallback(async () => {
    selectedFileDB.current = null;
    descriptionDB.current = '';

    setDescription('');
    setFileName(null);
  }, []);

  const validateFields = (descriptionField: string) => {
    if (!checkerString(descriptionField)) {
      setError('Description must not be empty!');
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(
    async (event: { preventDefault: () => void; }) => {
      setError('');
      event.preventDefault();
      if (validateFields(descriptionDB.current)) {
        if (selectedFileDB.current !== null) {
          setSubmitButtonPressed(true);
          const dataField = new FormData();
          dataField.append('image', selectedFileDB.current);
          dataField.append('description', descriptionDB.current);

          try {
            const rawResponse = await fetch('/api/announcement/create', {
              method: 'POST',
              body: dataField
            });
            const content: Result = await rawResponse.json();
            if (content.status) {
              await reset();
              toast({
                title: 'Success',
                description: content.msg,
                status: 'success',
                duration: 5000,
                isClosable: true
              });

              await fetchData();
            } else {
              toast({
                title: 'Error',
                description: content.error,
                status: 'error',
                duration: 5000,
                isClosable: true
              });
            }
          } catch (error) {
            console.error(error);
          }
          setSubmitButtonPressed(false);
        }
      }
    },
    [fetchData, reset, toast]
  );

  const onFileChange = async (event: { target: { files: any[] | any; }; }) => {
    try {
      const file = event.target.files[0];
      if (file !== undefined && file !== null && file.name !== undefined) {
        selectedFileDB.current = file;
        setFileName(file.name);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const includeActionButton = useCallback(
    async (content: Announcement[]) => {
      if (content !== undefined && content !== undefined) {
        const contentRes: Announcement[] = content;
        const selectionEdit: JSX.Element[] = [];

        const allAnnouncement: Announcement[] = [];
        selectionEdit.push(<option key='' value='' aria-label='Default' />);

        for (let key = 0; key < contentRes.length; key += 1) {
          if (contentRes[key]) {
            const dataField: Announcement = contentRes[key];

            selectionEdit.push(
              <option key={dataField.id} value={dataField.id}>
                {dataField.description}
              </option>
            );

            allAnnouncement.push(dataField);
            const buttons = await generateActionButton(dataField);
            dataField.action = buttons;
          }
        }

        setAnnounceDropdown(selectionEdit);
        announceData.current = allAnnouncement;
        setData(contentRes);

        if (contentRes.length % pageSizeDB.current === 0) {
          setPageCount(Math.floor(contentRes.length / pageSizeDB.current));
        } else {
          setPageCount(Math.floor(contentRes.length / pageSizeDB.current) + 1);
        }
      }
    },
    [generateActionButton]
  );

  generateActionButton = useCallback(
    async (content: Announcement) => {
      const button: JSX.Element = (
        <Button
          size='sm'
          leftIcon={<InfoOutlineIcon />}
          onClick={(event) => {
            event.preventDefault();
            if (
              router.isReady &&
              content.image !== undefined &&
              checkerString(content.image)
            ) {
              router.push(content.image);
            }
          }}
        >
          View Image
        </Button>
      );

      return button;
    },
    [router]
  );

  const fetchDataTable = useCallback(async () => {
    setSubmitButtonPressed(true);
    try {
      const rawResponse = await fetch(
        `/api/announcement/fetch?limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
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

  useEffect(() => {
    async function generate () {
      await fetchData();
    }

    generate();
  }, [fetchData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Description',
        accessor: 'description'
      },
      {
        Header: 'Actions',
        accessor: 'action'
      }
    ],
    []
  );

  const changeDataEdit = (dataField: Announcement) => {
    setDescriptionEdit(dataField.description);
    descriptionDBEdit.current = dataField.description;
  };

  const onAnnounceIDChangeEdit = async (event: {
    target: { value: string; };
  }) => {
    if (event.target.value) {
      const { value } = event.target;
      announceIDDBEdit.current = value;
      setAnnounceIDEdit(value);

      if (announceData.current !== []) {
        for (let key = 0; key < announceData.current.length; key += 1) {
          if (announceData.current[key]) {
            const dataField: Announcement = announceData.current[key];
            if (dataField.id === value) {
              changeDataEdit(dataField);
            }
          }
        }
      }
    }
  };

  const validateFieldsEdit = (idField: string, descriptionField: string) => {
    if (!checkerString(idField)) {
      setErrorEdit('ID must not be empty!');
      return false;
    }

    if (!checkerString(descriptionField)) {
      setErrorEdit('Description must not be empty!');
      return false;
    }

    return true;
  };

  const handleSubmitEdit = useCallback(
    async (event: { preventDefault: () => void; }) => {
      setErrorEdit('');
      event.preventDefault();

      if (
        validateFieldsEdit(announceIDDBEdit.current, descriptionDBEdit.current)
      ) {
        const dataField = new FormData();
        dataField.append('id', announceIDDBEdit.current);
        dataField.append('description', descriptionDBEdit.current);

        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/announcement/edit', {
            method: 'POST',
            body: dataField
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            await resetEdit();
            toast({
              title: 'Success',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true
            });

            await fetchData();
          } else {
            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 5000,
              isClosable: true
            });
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
      }
    },
    [fetchData, resetEdit, toast]
  );

  resetEdit = useCallback(async () => {
    descriptionDBEdit.current = '';
    setDescriptionEdit('');
  }, []);

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
    [fetchDataTable]
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
                <Text>No announcements found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data && data.length > 0 && (
            <Box w='full' overflow='auto'>
              <Stack spacing={30} align='center' justify='center'>
                <TableWidget
                  id='manage-announcement-table'
                  columns={columns}
                  data={data}
                  controlledPageCount={pageCount}
                  dataHandler={onTableChange}
                />
              </Stack>
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
        <MotionBox key='submit-form'>
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
            <Heading size='md'>Create new announcement</Heading>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id='description'>
                  <FormLabel>Description</FormLabel>
                  <Input
                    type='text'
                    placeholder='Description'
                    value={description}
                    size='lg'
                    onChange={(event) => {
                      setDescription(event.currentTarget.value);
                      descriptionDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize='sm' fontWeight='md' color='gray.700'>
                    Announcement Photo
                  </FormLabel>
                  {fileName && <Text>File uploaded: {fileName}</Text>}
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
                      >
                        <path
                          d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </Icon>
                      <Flex
                        fontSize='sm'
                        color='gray.600'
                        alignItems='baseline'
                      >
                        <chakra.label
                          htmlFor='file-upload'
                          cursor='pointer'
                          rounded='md'
                          fontSize='md'
                          color='brand.600'
                          pos='relative'
                          _hover={{
                            color: 'brand.400'
                          }}
                        >
                          <span>Upload a file</span>
                          <VisuallyHidden>
                            <input
                              id='file-upload'
                              name='file-upload'
                              type='file'
                              onChange={onFileChange}
                            />
                          </VisuallyHidden>
                        </chakra.label>
                      </Flex>
                      <Text fontSize='xs' color='gray.500'>
                        PNG, JPG up to 10MB
                      </Text>
                    </Stack>
                  </Flex>
                </FormControl>

                {checkerString(errorMsg) && (
                  <Stack align='center'>
                    <Text>{errorMsg}</Text>
                  </Stack>
                )}

                <Stack spacing={10}>
                  <Button
                    type='submit'
                    bg='blue.400'
                    color='white'
                    disabled={submitButtonPressed}
                    _hover={{
                      bg: 'blue.500'
                    }}
                  >
                    Create
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </MotionBox>

        <MotionBox key='edit-form'>
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
            <Heading size='md'>Edit existing announcement</Heading>
            <form onSubmit={handleSubmitEdit}>
              <Stack spacing={4}>
                {announceDropdown && (
                  <Stack spacing={3} w='full'>
                    <FormLabel>Select Announcement</FormLabel>
                    <Select
                      value={announceIDEdit}
                      onChange={onAnnounceIDChangeEdit}
                      size='sm'
                    >
                      {announceDropdown}
                    </Select>
                  </Stack>
                )}

                <FormControl id='description'>
                  <FormLabel>Description</FormLabel>
                  <Input
                    type='text'
                    placeholder='Description'
                    value={descriptionEdit}
                    size='lg'
                    onChange={(event) => {
                      setDescriptionEdit(event.currentTarget.value);
                      descriptionDBEdit.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                {checkerString(errorEdit) && (
                  <Stack align='center'>
                    <Text>{errorEdit}</Text>
                  </Stack>
                )}

                <Stack spacing={5}>
                  <Button
                    type='submit'
                    bg='blue.400'
                    color='white'
                    disabled={submitButtonPressed}
                    _hover={{
                      bg: 'blue.500'
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    bg='red.400'
                    color='white'
                    disabled={submitButtonPressed}
                    _hover={{
                      bg: 'red.500'
                    }}
                    onClick={async () => await handleDelete()}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </MotionBox>
      </MotionSimpleGrid>
    </Auth>
  );
}
