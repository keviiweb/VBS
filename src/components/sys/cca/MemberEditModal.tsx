import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Box,
  Button,
  Flex,
  FormLabel,
  FormControl,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import LoadingModal from '@components/sys/misc/LoadingModal';
import TableWidget from '@components/sys/misc/TableWidget';

import { cardVariant, parentVariant } from '@root/motion';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { Result } from 'types/api';
import { User } from 'types/misc/user';
import { CCARecord } from 'types/cca/ccaRecord';
import { checkerString } from '@root/src/constants/sys/helper';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * Renders a modal for the Member Create modal
 *
 * This modal consist of the entire workflow process of editing a member
 *
 * 1. Search the name of the resident
 * 2. Add the member to the CCA or Remove the member from the cca
 *
 * @param param0 Modal functions
 * @returns A modal
 */
export default function MemberEditModal({
  isOpen,
  onClose,
  modalData,
  dataHandler,
}) {
  const SEARCH_THRESHOLD = 4;
  const SEARCH_INTERVAL = 3000;
  const currentTime = useRef(Date.now());

  const toast = useToast();

  const ccaIDDB = useRef('');
  const searchInputDB = useRef('');

  const [data, setData] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState('');

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  const reset = () => {
    ccaIDDB.current = '';
    searchInputDB.current = '';

    setSubmitButtonPressed(false);
    setSearchInput('');
    setData([]);
  };

  const handleModalCloseButton = useCallback(async () => {
    setTimeout(async () => {
      setSubmitButtonPressed(true);
      await dataHandler();
      reset();
      onClose();
    }, 200);
  }, [dataHandler, onClose]);

  const handleAddMember = useCallback(
    async (email: string) => {
      if (checkerString(ccaIDDB.current) && checkerString(email)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/ccaRecord/create', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ccaID: ccaIDDB.current,
              email,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            toast({
              title: 'Resident added to CCA',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          } else {
            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 20000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
        setSearchInput('');
        setData([]);
      }
    },
    [toast],
  );

  const handleRemoveMember = useCallback(
    async (email: string) => {
      if (checkerString(ccaIDDB.current) && checkerString(email)) {
        setSubmitButtonPressed(true);
        try {
          const rawResponse = await fetch('/api/ccaRecord/delete', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ccaID: ccaIDDB.current,
              email,
            }),
          });
          const content: Result = await rawResponse.json();
          if (content.status) {
            toast({
              title: 'Resident removed from CCA',
              description: content.msg,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          } else {
            toast({
              title: 'Error',
              description: content.error,
              status: 'error',
              duration: 20000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error(error);
        }
        setSubmitButtonPressed(false);
        setSearchInput('');
        setData([]);
      }
    },
    [toast],
  );

  const generateActionButton = useCallback(
    async (content: User) => {
      const { id, email, isMemberOfCCA } = content;

      if (id !== undefined && isMemberOfCCA !== undefined) {
        if (isMemberOfCCA) {
          const button: JSX.Element = (
            <Button
              key={`remove-member-all-button-${id}`}
              size='sm'
              leftIcon={<CloseIcon />}
              disabled={submitButtonPressed}
              onClick={async () => await handleRemoveMember(email)}
            >
              Remove Member
            </Button>
          );
          return button;
        } else {
          const button: JSX.Element = (
            <Button
              key={`add-member-all-button-${id}`}
              size='sm'
              leftIcon={<CheckIcon />}
              disabled={submitButtonPressed}
              onClick={async () => await handleAddMember(email)}
            >
              Add Member
            </Button>
          );
          return button;
        }
      }
    },
    [submitButtonPressed, handleRemoveMember, handleAddMember],
  );

  const includeActionButton = useCallback(
    async (content: User[]) => {
      if (content.length > 0) {
        const users: User[] = content;
        if (users.length > 0) {
          for (let key = 0; key < users.length; key += 1) {
            const dataField: User = users[key];
            const buttons = await generateActionButton(dataField);
            dataField.action = buttons;
          }
          setData(users);
        }
      }
    },
    [generateActionButton],
  );

  const handleSearch = useCallback(
    async (input: string) => {
      if (Date.now() - currentTime.current >= SEARCH_INTERVAL) {
        if (checkerString(ccaIDDB.current)) {
          setSubmitButtonPressed(true);
          try {
            const rawResponse = await fetch('/api/user/search', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ccaID: ccaIDDB.current,
                input,
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
        }
        currentTime.current = Date.now();
      }
    },
    [includeActionButton],
  );

  useEffect(() => {
    async function setupData(modalDataField: CCARecord) {
      const ccaidField: string = checkerString(modalDataField.ccaID)
        ? modalDataField.ccaID
        : '';
      ccaIDDB.current = ccaidField;
    }

    if (modalData !== undefined && modalData !== null) {
      setupData(modalData);
    }
  }, [modalData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
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

          <MotionSimpleGrid
            mt='3'
            minChildWidth={{ base: 'full', md: '500px', lg: '800px' }}
            spacing='2em'
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox variants={cardVariant} key='motion-box-searchinput'>
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
                mt={30}
              >
                <Stack spacing={10}>
                  <Stack
                    w={{ base: 'full', md: '500px', lg: '500px' }}
                    direction='row'
                  >
                    <FormControl id='name'>
                      <FormLabel>
                        <Text
                          w={40}
                          textTransform='uppercase'
                          lineHeight='5'
                          fontWeight='bold'
                          letterSpacing='tight'
                          mr={5}
                        >
                          Search Resident
                        </Text>
                      </FormLabel>
                      <Input
                        type='text'
                        placeholder='Name'
                        value={searchInput}
                        size='lg'
                        onChange={async (event) => {
                          setSearchInput(event.currentTarget.value);
                          searchInputDB.current = event.currentTarget.value;
                        }}
                        onKeyUp={async (event) => {
                          if (
                            event.currentTarget.value.length >= SEARCH_THRESHOLD
                          ) {
                            await handleSearch(event.currentTarget.value);
                          }
                        }}
                      />
                    </FormControl>
                  </Stack>
                  {data.length > 0 && (
                    <TableWidget
                      id='admin-manage-booking-table'
                      columns={columns}
                      data={data}
                      controlledPageCount={1}
                      dataHandler={null}
                      showPage={false}
                    />
                  )}
                </Stack>
              </Flex>
            </MotionBox>
          </MotionSimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button
            key='close-button'
            disabled={submitButtonPressed}
            bg='red.400'
            color='white'
            w='150px'
            size='lg'
            _hover={{ bg: 'red.600' }}
            onClick={async () => {
              await handleModalCloseButton();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
