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
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  SimpleGrid,
  Stack,
  Select,
  useToast,
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import Auth from '@components/sys/Auth';
import TableWidget from '@components/sys/misc/TableWidget';
import LoadingModal from '@components/sys/misc/LoadingModal';
import UserModal from '@components/sys/misc/UserModal';

import { checkerString } from '@constants/sys/helper';

import { User } from 'types/misc/user';
import { Result } from 'types/api';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function ManageUsers() {
  const [modalData, setModalData] = useState<User | null>(null);
  const toast = useToast();

  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<User[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomNum, setRoomNum] = useState('');
  const [studentID, setStudentID] = useState('');
  const [admin, setAdmin] = useState(false);

  const nameDB = useRef('');
  const emailDB = useRef('');
  const roomNumDB = useRef('');
  const studentIDDB = useRef('');
  const adminDB = useRef(false);

  const [nameEdit, setNameEdit] = useState('');
  const [emailEdit, setEmailEdit] = useState('');
  const [roomNumEdit, setRoomNumEdit] = useState('');
  const [studentIDEdit, setStudentIDEdit] = useState('');
  const [adminEdit, setAdminEdit] = useState(false);

  const nameDBEdit = useRef('');
  const emailDBEdit = useRef('');
  const roomNumDBEdit = useRef('');
  const studentIDDBEdit = useRef('');
  const adminDBEdit = useRef(false);

  const [errorMsg, setError] = useState('');
  const [errorMsgEdit, setErrorEdit] = useState('');

  const [userIDEdit, setUserIDEdit] = useState('');
  const userIDDBEdit = useRef('');

  let generateActionButton: any;
  let fetchData: any;

  const [userDropdown, setUserDropdown] = useState<JSX.Element[]>([]);
  const userData = useRef<User[]>([]);

  const PAGESIZE: number = 10;
  const PAGEINDEX: number = 0;

  const [pageCount, setPageCount] = useState(0);
  const pageSizeDB = useRef(PAGESIZE);
  const pageIndexDB = useRef(PAGEINDEX);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const handleDetails = useCallback((content: User) => {
    setModalData(content);
  }, []);

  const reset = useCallback(async () => {
    nameDB.current = '';
    emailDB.current = '';
    roomNumDB.current = '';
    studentIDDB.current = '';
    adminDB.current = false;

    setName('');
    setEmail('');
    setRoomNum('');
    setStudentID('');
    setAdmin(false);
  }, []);

  const resetEdit = useCallback(async () => {
    userIDDBEdit.current = '';
    nameDBEdit.current = '';
    emailDBEdit.current = '';
    roomNumDBEdit.current = '';
    studentIDDBEdit.current = '';
    adminDBEdit.current = false;

    setUserIDEdit('');
    setNameEdit('');
    setEmailEdit('');
    setRoomNumEdit('');
    setStudentIDEdit('');
    setAdminEdit(false);
  }, []);

  const validateFields = (
    nameField: string,
    emailField: string,
    roomNumField: string,
    studentIDField: string,
  ) => {
    // super basic validation here
    if (!checkerString(nameField)) {
      setError('Name must not be empty!');
      return false;
    }

    if (!checkerString(emailField)) {
      setError('Email must not be empty!');
      return false;
    }

    if (!checkerString(roomNumField)) {
      setError('Room Number must not be empty!');
      return false;
    }

    if (!checkerString(studentIDField)) {
      setError('Student ID must not be empty!');
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(
    async (event: { preventDefault: () => void }) => {
      setError('');
      event.preventDefault();
      if (
        validateFields(
          nameDB.current,
          emailDB.current,
          roomNumDB.current,
          studentIDDB.current,
        )
      ) {
        setSubmitButtonPressed(true);

        try {
          const rawResponse = await fetch('/api/user/create', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: nameDB.current,
              email: emailDB.current,
              roomNum: roomNumDB.current,
              studentID: studentIDDB.current,
              admin: adminDB.current,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            setSubmitButtonPressed(false);

            toast({
              title: 'User Created.',
              description: 'You have successfully created an user',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });

            await reset();
            await fetchData();
          } else {
            setSubmitButtonPressed(false);

            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }

          return true;
        } catch (error) {
          setSubmitButtonPressed(false);
          return false;
        }
      }

      return false;
    },
    [fetchData, reset, toast],
  );

  const includeActionButton = useCallback(
    async (content: { count: number; res: User[] }) => {
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
              </option>,
            );

            allUser.push(dataField);
            const buttons = await generateActionButton(dataField);
            dataField.action = buttons;
          }
        }

        userData.current = allUser;
        setUserDropdown(selectionEdit);
        setData(contentRes);

        setPageCount(Math.floor(content.count / pageSizeDB.current) + 1);
      }
    },
    [generateActionButton],
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
    [handleDetails],
  );

  const fetchDataTable = useCallback(async () => {
    try {
      const rawResponse = await fetch(
        `/api/user/fetch?limit=${pageSizeDB.current}&skip=${pageIndexDB.current}`,
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
  }, [includeActionButton]);

  fetchData = useCallback(async () => {
    setLoadingData(true);
    setData([]);

    await fetchDataTable();
    setLoadingData(false);
  }, [fetchDataTable]);

  useEffect(() => {
    async function generate() {
      await fetchData();
    }

    generate();
  }, [fetchData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'StudentID',
        accessor: 'studentID',
      },
      {
        Header: 'Room Number',
        accessor: 'roomNum',
      },
      {
        Header: 'Admin',
        accessor: 'adminStr',
      },
      {
        Header: 'Actions',
        accessor: 'action',
      },
    ],
    [],
  );

  const changeDataEdit = (dataField: User) => {
    setNameEdit(dataField.name);
    setEmailEdit(dataField.email);
    setStudentIDEdit(dataField.studentID);
    setRoomNumEdit(dataField.roomNum);
    setAdminEdit(dataField.admin);

    nameDBEdit.current = dataField.name;
    emailDBEdit.current = dataField.email;
    studentIDDBEdit.current = dataField.studentID;
    roomNumDBEdit.current = dataField.roomNum;
    adminDBEdit.current = dataField.admin;
  };

  const validateFieldsEdit = (
    idField: string,
    nameField: string,
    emailField: string,
    roomNumField: string,
    studentIDField: string,
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

    if (!checkerString(roomNumField)) {
      setErrorEdit('Room Number must not be empty!');
      return false;
    }

    if (!checkerString(studentIDField)) {
      setErrorEdit('Student ID must not be empty!');
      return false;
    }

    return true;
  };

  const handleSubmitEdit = useCallback(
    async (event: { preventDefault: () => void }) => {
      setErrorEdit('');
      event.preventDefault();

      if (
        validateFieldsEdit(
          userIDDBEdit.current,
          nameDBEdit.current,
          emailDBEdit.current,
          roomNumDBEdit.current,
          studentIDDBEdit.current,
        )
      ) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/user/edit', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: userIDDBEdit.current,
              name: nameDBEdit.current,
              email: emailDBEdit.current,
              roomNum: roomNumDBEdit.current,
              studentID: studentIDDBEdit.current,
              admin: adminDBEdit.current,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            setSubmitButtonPressed(false);

            toast({
              title: 'User Edited',
              description: 'You have successfully edited an user',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });

            await resetEdit();
            await fetchData();
          } else {
            setSubmitButtonPressed(false);

            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }

          return true;
        } catch (error) {
          setSubmitButtonPressed(false);
          return false;
        }
      }

      return false;
    },
    [fetchData, resetEdit, toast],
  );

  const onUserIDChangeEdit = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      userIDDBEdit.current = value;
      setUserIDEdit(value);

      if (userData.current !== []) {
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
          {loadingData && !data ? (
            <Text>Loading Please wait...</Text>
          ) : (
            <Box minWidth='full' mt={30}>
              <Stack spacing={30} align='center' justify='center'>
                <TableWidget
                  key={1}
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
        <MotionBox>
          {' '}
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

                <FormControl id='studentID'>
                  <FormLabel>Student ID</FormLabel>
                  <Input
                    type='text'
                    placeholder='Student ID'
                    value={studentID}
                    size='lg'
                    onChange={(event) => {
                      setStudentID(event.currentTarget.value);
                      studentIDDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id='roomNum'>
                  <FormLabel>Room Num</FormLabel>
                  <Input
                    type='text'
                    placeholder='Room Num'
                    value={roomNum}
                    size='lg'
                    onChange={(event) => {
                      setRoomNum(event.currentTarget.value);
                      roomNumDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <Stack spacing={5} direction='row'>
                  <Checkbox
                    isChecked={admin}
                    onChange={(event) => {
                      setAdmin(event.target.checked);
                      adminDB.current = event.target.checked;
                    }}
                  >
                    Admin
                  </Checkbox>
                </Stack>

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
                      bg: 'blue.500',
                    }}
                  >
                    Create
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </MotionBox>

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

                <FormControl id='studentIDEdit'>
                  <FormLabel>Student ID</FormLabel>
                  <Input
                    type='text'
                    placeholder='Student ID'
                    value={studentIDEdit}
                    size='lg'
                    onChange={(event) => {
                      setStudentIDEdit(event.currentTarget.value);
                      studentIDDBEdit.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id='roomNumEdit'>
                  <FormLabel>Room Num</FormLabel>
                  <Input
                    type='text'
                    placeholder='Room Num'
                    value={roomNumEdit}
                    size='lg'
                    onChange={(event) => {
                      setRoomNumEdit(event.currentTarget.value);
                      roomNumDBEdit.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <Stack spacing={5} direction='row'>
                  <Checkbox
                    isChecked={adminEdit}
                    onChange={(event) => {
                      setAdminEdit(event.target.checked);
                      adminDBEdit.current = event.target.checked;
                    }}
                  >
                    Admin
                  </Checkbox>
                </Stack>

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
                      bg: 'blue.500',
                    }}
                  >
                    Update
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
