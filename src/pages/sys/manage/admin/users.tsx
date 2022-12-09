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
  FormControl,
  FormLabel,
  Flex,
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

import Auth from '@components/sys/Auth';
import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/misc/LoadingModal';
import UserModal from '@components/sys/misc/UserModal';

import { checkerString } from '@constants/sys/helper';
import { actions, levels } from '@constants/sys/admin';
import hasPermission from '@constants/sys/permission';

import { User } from 'types/misc/user';
import { Result } from 'types/api';
import { CCAAttendance } from 'types/cca/ccaAttendance';
import { Session } from 'next-auth/core/types';

import { GetServerSideProps } from 'next';
import { currentSession } from '@helper/sys/sessionServer';

import { CSVLink } from 'react-csv';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Renders a component that displays the list of users and allow users to create or edit new users.
 *
 * Creating and Editing a user is an OWNER-level task only
 *
 * @param props Permission level of user
 * @returns Manage User page
 */
export default function ManageUsers (props: any) {
  const [modalData, setModalData] = useState<User | null>(null);
  const toast = useToast();

  const [level, setLevel] = useState(levels.USER);

  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<User[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [admin, setAdmin] = useState(levels.USER);

  const nameDB = useRef('');
  const emailDB = useRef('');
  const adminDB = useRef(levels.USER);

  const [nameEdit, setNameEdit] = useState('');
  const [emailEdit, setEmailEdit] = useState('');
  const [adminEdit, setAdminEdit] = useState(levels.USER);

  const nameDBEdit = useRef('');
  const emailDBEdit = useRef('');
  const adminDBEdit = useRef(levels.USER);

  const [errorMsg, setError] = useState('');
  const [errorMsgEdit, setErrorEdit] = useState('');
  const [errorMsgFile, setErrorFile] = useState('');
  const [errorMsgFileCCA, setErrorFileCCA] = useState('');

  const [userIDEdit, setUserIDEdit] = useState('');
  const userIDDBEdit = useRef('');

  let generateActionButton: any;
  let fetchData: any;

  const [userDropdown, setUserDropdown] = useState<JSX.Element[]>([]);
  const userData = useRef<User[]>([]);

  const [levelDropdown, setLevelDropdown] = useState<JSX.Element[]>([]);

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const selectedFileDB = useRef<string | Blob | null>(null);
  const [fileName, setFileName] = useState(null);

  const selectedFileCCADB = useRef<string | Blob | null>(null);
  const [fileNameCCA, setFileNameCCA] = useState(null);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const CSVheaders = [
    { label: 'Session Name', key: 'sessionName' },
    { label: 'CCA Name', key: 'ccaName' },
    { label: 'Date', key: 'dateStr' },
    { label: 'Time', key: 'time' },
    { label: 'Email', key: 'sessionEmail' },
    { label: 'Attendance', key: 'ccaAttendance' }
  ];

  const [CSVdata, setCSVdata] = useState<CCAAttendance[]>([]);

  const handleDetails = useCallback((content: User) => {
    setModalData(content);
  }, []);

  const reset = useCallback(async () => {
    nameDB.current = '';
    emailDB.current = '';
    adminDB.current = levels.USER;

    setName('');
    setEmail('');
    setAdmin(levels.USER);
  }, []);

  const resetFile = useCallback(async () => {
    selectedFileDB.current = null;
    setFileName(null);
  }, []);

  const resetFileCCA = useCallback(async () => {
    selectedFileCCADB.current = null;
    setFileNameCCA(null);
  }, []);

  const resetEdit = useCallback(async () => {
    userIDDBEdit.current = '';
    nameDBEdit.current = '';
    emailDBEdit.current = '';
    adminDBEdit.current = levels.USER;

    setUserIDEdit('');
    setNameEdit('');
    setEmailEdit('');
    setAdminEdit(levels.USER);
  }, []);

  const validateFields = (nameField: string, emailField: string) => {
    // super basic validation here
    if (!checkerString(nameField)) {
      setError('Name must not be empty!');
      return false;
    }

    if (!checkerString(emailField)) {
      setError('Email must not be empty!');
      return false;
    }

    return true;
  };

  const handleSubmitCCADownload = useCallback(
    async (event: { preventDefault: () => void; }) => {
      setCSVdata([]);
      event.preventDefault();
      setSubmitButtonPressed(true);

      try {
        const rawResponse = await fetch('/api/ccaAttendance/file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
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
    },
    []
  );

  const handleSubmitFile = useCallback(
    async (event: { preventDefault: () => void; }) => {
      setErrorFile('');
      event.preventDefault();
      if (selectedFileDB.current !== null) {
        setSubmitButtonPressed(true);

        const dataField = new FormData();
        dataField.append('file', selectedFileDB.current);

        try {
          const rawResponse = await fetch('/api/user/file', {
            method: 'POST',
            body: dataField
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            toast({
              title: 'User Created.',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true
            });

            await resetFile();
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
      } else {
        setErrorFile('Please upload a file');
      }

      return false;
    },
    [fetchData, resetFile, toast]
  );

  const handleSubmitFileCCA = useCallback(
    async (event: { preventDefault: () => void; }) => {
      setErrorFileCCA('');
      event.preventDefault();
      if (selectedFileCCADB.current !== null) {
        setSubmitButtonPressed(true);

        const dataField = new FormData();
        dataField.append('file', selectedFileCCADB.current);

        try {
          const rawResponse = await fetch('/api/ccaRecord/file', {
            method: 'POST',
            body: dataField
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            toast({
              title: 'CCA Records populated',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true
            });

            await resetFileCCA();
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
      } else {
        setErrorFileCCA('Please upload a file');
      }

      return false;
    },
    [fetchData, resetFileCCA, toast]
  );

  const handleSubmit = useCallback(
    async (event: { preventDefault: () => void; }) => {
      setError('');
      event.preventDefault();
      if (validateFields(nameDB.current, emailDB.current)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/user/create', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: nameDB.current,
              email: emailDB.current,
              admin: adminDB.current
            })
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            toast({
              title: 'User Created.',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true
            });

            await reset();
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

      return false;
    },
    [fetchData, reset, toast]
  );

  const includeActionButton = useCallback(
    async (content: { count: number; res: User[]; }) => {
      if (
        (content.count !== undefined || content.count !== null) &&
        (content.res !== undefined || content.res !== null)
      ) {
        const contentRes: User[] = content.res;
        const selectionEdit: JSX.Element[] = [];
        const allUser: User[] = [];
        selectionEdit.push(<option key='' value='' aria-label='Default' />);

        for (let key = 0; key < contentRes.length; key += 1) {
          if (contentRes[key]) {
            const dataField: User = contentRes[key];

            selectionEdit.push(
              <option key={dataField.id} value={dataField.id}>
                {dataField.name}
              </option>
            );

            allUser.push(dataField);
            const buttons = await generateActionButton(dataField);
            dataField.action = buttons;
          }
        }

        userData.current = allUser;
        setUserDropdown(selectionEdit);
        setData(contentRes);

        if (content.count % pageSizeDB.current === 0) {
          setPageCount(Math.floor(content.count / pageSizeDB.current));
        } else {
          setPageCount(Math.floor(content.count / pageSizeDB.current) + 1);
        }
      }
    },
    [generateActionButton]
  );

  generateActionButton = useCallback(
    async (content: User) => {
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
    [handleDetails]
  );

  const fetchDataTable = useCallback(async () => {
    setSubmitButtonPressed(true);
    try {
      const rawResponse = await fetch(
        `/api/user/fetch?limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
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

  const onFileChange = async (event: { target: { files: any[] | any; }; }) => {
    setErrorFile('');
    try {
      const file = event.target.files[0];
      if (file !== undefined && file !== null && file.name !== undefined) {
        selectedFileDB.current = file;
        setFileName(file.name);
      } else {
        setErrorFile('File name not found');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onFileChangeCCA = async (event: { target: { files: any[] | any; }; }) => {
    setErrorFileCCA('');
    try {
      const file = event.target.files[0];
      if (file !== undefined && file !== null && file.name !== undefined) {
        selectedFileCCADB.current = file;
        setFileNameCCA(file.name);
      } else {
        setErrorFileCCA('File name not found');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateLevelDropdown = useCallback(async () => {
    const selectionDropdown: JSX.Element[] = [];

    const keys = Object.keys(levels);
    const values = Object.values(levels);

    for (let key = 0; key < keys.length; key += 1) {
      selectionDropdown.push(
        <option key={values[key]} value={values[key]}>
          {keys[key]}
        </option>
      );
    }

    setLevelDropdown(selectionDropdown);
  }, []);

  useEffect(() => {
    async function generate (propsField: any) {
      setLevel(propsField.data);

      await fetchData();
      await generateLevelDropdown();
    }

    generate(props);
  }, [fetchData, props, generateLevelDropdown]);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Admin',
        accessor: 'adminStr'
      },
      {
        Header: 'Accepted Terms',
        accessor: 'acceptedTermStr'
      },
      {
        Header: 'Actions',
        accessor: 'action'
      }
    ],
    []
  );

  const changeDataEdit = (dataField: User) => {
    setNameEdit(dataField.name);
    setEmailEdit(dataField.email);
    setAdminEdit(dataField.admin);

    nameDBEdit.current = dataField.name;
    emailDBEdit.current = dataField.email;
    adminDBEdit.current = dataField.admin;
  };

  const validateFieldsEdit = (
    idField: string,
    nameField: string,
    emailField: string
  ) => {
    // super basic validation here
    if (!checkerString(idField)) {
      setErrorEdit('ID must not be empty!');
      return false;
    }

    if (!checkerString(nameField)) {
      setErrorEdit('Name must not be empty!');
      return false;
    }

    if (!checkerString(emailField)) {
      setErrorEdit('Email must not be empty!');
      return false;
    }

    return true;
  };

  const handleSubmitEdit = useCallback(
    async (event: { preventDefault: () => void; }) => {
      setErrorEdit('');
      event.preventDefault();

      if (
        validateFieldsEdit(
          userIDDBEdit.current,
          nameDBEdit.current,
          emailDBEdit.current
        )
      ) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/user/edit', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: userIDDBEdit.current,
              name: nameDBEdit.current,
              email: emailDBEdit.current,
              admin: adminDBEdit.current
            })
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            toast({
              title: 'User Edited',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true
            });

            await resetEdit();
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

      return false;
    },
    [fetchData, resetEdit, toast]
  );

  const onUserIDChangeEdit = async (event: { target: { value: string; }; }) => {
    if (event.target.value) {
      const { value } = event.target;
      userIDDBEdit.current = value;
      setUserIDEdit(value);

      if (userData.current.length > 0) {
        for (let key = 0; key < userData.current.length; key += 1) {
          if (userData.current[key]) {
            const dataField: User = userData.current[key];
            if (dataField.id === value) {
              changeDataEdit(dataField);
            }
          }
        }
      }
    }
  };

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
                <Text>No users found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data && data.length > 0 && (
            <Box w='full' overflow='auto'>
              <Stack spacing={30} align='center' justify='center'>
                <TableWidget
                  id='manage-users-table'
                  columns={columns}
                  data={data}
                  controlledPageCount={pageCount}
                  dataHandler={onTableChange}
                />
              </Stack>

              <UserModal
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
        {hasPermission(level, actions.FETCH_ALL_CCA_ATTENDANCE) && (
          <MotionBox>
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
              <Heading size='md'>Generate CCA Attendance Report</Heading>
              <form onSubmit={handleSubmitCCADownload}>
                <Stack spacing={4}>
                  <Stack spacing={10}>
                    <Text>
                      This will generate all CCA attendance records for all
                      users
                    </Text>
                    <Button
                      type='submit'
                      bg='blue.400'
                      color='white'
                      disabled={submitButtonPressed}
                      _hover={{
                        bg: 'blue.500'
                      }}
                    >
                      Generate
                    </Button>
                  </Stack>
                </Stack>
              </form>

              {CSVdata.length > 0 && (
                <Button
                  type='submit'
                  bg='red.400'
                  color='white'
                  disabled={submitButtonPressed}
                  _hover={{
                    bg: 'red.500'
                  }}
                >
                  <CSVLink
                    data={CSVdata}
                    headers={CSVheaders}
                    filename='overall.csv'
                    target='_blank'
                  >
                    Download
                  </CSVLink>
                </Button>
              )}
            </Stack>
          </MotionBox>
        )}

        {hasPermission(level, actions.CREATE_USER) && (
          <MotionBox>
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
              <Heading size='md'>Create new user</Heading>
              <form onSubmit={handleSubmitFile}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize='sm' fontWeight='md' color='gray.700'>
                      CSV File
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
                        />
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
                                accept='.csv'
                                onChange={onFileChange}
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

                  {checkerString(errorMsgFile) && (
                    <Stack align='center'>
                      <Text>{errorMsgFile}</Text>
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
        )}

        {hasPermission(level, actions.POPULATE_CCA_RECORD) && (
          <MotionBox>
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
              <Heading size='md'>Populate CCA Records</Heading>
              <form onSubmit={handleSubmitFileCCA}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize='sm' fontWeight='md' color='gray.700'>
                      CSV File
                    </FormLabel>
                    {fileNameCCA && <Text>File uploaded: {fileNameCCA}</Text>}
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
                            htmlFor='file-upload-cca'
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
                                id='file-upload-cca'
                                name='file-upload-cca'
                                type='file'
                                accept='.csv'
                                onChange={onFileChangeCCA}
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

                  {checkerString(errorMsgFileCCA) && (
                    <Stack align='center'>
                      <Text>{errorMsgFileCCA}</Text>
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
                      Populate
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Stack>
          </MotionBox>
        )}

        {hasPermission(level, actions.CREATE_USER) && (
          <MotionBox key='create-user'>
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
              <Heading size='md'>Create new user</Heading>
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl id='name'>
                    <FormLabel>Name</FormLabel>
                    <Input
                      type='text'
                      placeholder='Name'
                      value={name}
                      size='lg'
                      onChange={(event) => {
                        setName(event.currentTarget.value);
                        nameDB.current = event.currentTarget.value;
                      }}
                    />
                  </FormControl>

                  <FormControl id='email'>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type='email'
                      placeholder='Email'
                      value={email}
                      size='lg'
                      onChange={(event) => {
                        setEmail(event.currentTarget.value);
                        emailDB.current = event.currentTarget.value;
                      }}
                    />
                  </FormControl>

                  {levelDropdown && (
                    <Stack spacing={3} w='full'>
                      <FormLabel>Permission Level</FormLabel>
                      <Select
                        value={admin}
                        onChange={(event) => {
                          setAdmin(Number(event.target.value));
                          adminDB.current = Number(event.target.value);
                        }}
                        size='sm'
                      >
                        {levelDropdown}
                      </Select>
                    </Stack>
                  )}

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
        )}

        {hasPermission(level, actions.EDIT_USER) && userDropdown && (
          <MotionBox key='edit-user'>
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
              <Heading size='md'>Edit existing user</Heading>
              <form onSubmit={handleSubmitEdit}>
                <Stack spacing={4}>
                  {userDropdown && (
                    <Stack spacing={3} w='full'>
                      <FormLabel>Select User</FormLabel>
                      <Select
                        value={userIDEdit}
                        onChange={onUserIDChangeEdit}
                        size='sm'
                      >
                        {userDropdown}
                      </Select>
                    </Stack>
                  )}

                  <FormControl id='nameEdit'>
                    <FormLabel>Name</FormLabel>
                    <Input
                      type='text'
                      placeholder='Name'
                      value={nameEdit}
                      size='lg'
                      onChange={(event) => {
                        setNameEdit(event.currentTarget.value);
                        nameDBEdit.current = event.currentTarget.value;
                      }}
                    />
                  </FormControl>

                  <FormControl id='emailEdit'>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type='email'
                      placeholder='Email'
                      value={emailEdit}
                      size='lg'
                      onChange={(event) => {
                        setEmailEdit(event.currentTarget.value);
                        emailDBEdit.current = event.currentTarget.value;
                      }}
                    />
                  </FormControl>

                  {levelDropdown && (
                    <Stack spacing={3} w='full'>
                      <FormLabel>Permission Level</FormLabel>
                      <Select
                        value={adminEdit}
                        onChange={(event) => {
                          setAdminEdit(Number(event.target.value));
                          adminDBEdit.current = Number(event.target.value);
                        }}
                        size='sm'
                      >
                        {levelDropdown}
                      </Select>
                    </Stack>
                  )}

                  {checkerString(errorMsgEdit) && (
                    <Stack align='center'>
                      <Text>{errorMsgEdit}</Text>
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
                      Update
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
    'public, s-maxage=10, stale-while-revalidate=59'
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
      data
    }
  };
};
