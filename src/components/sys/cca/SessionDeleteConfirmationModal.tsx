import React from 'react';
import {
  Box,
  Button,
  Flex,
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

/**
 * Renders a modal that prompts the user to confirm the deletion of a particular session.
 *
 * When the user clicks on the submit button, the callback function is triggered
 *
 * @param param0 Modal functions and callback function
 * @returns A modal
 */
export default function SessionDeleteConfirmationModal({
  isOpen,
  onClose,
  modalData,
  dataHandler,
}) {
  const handleModalCloseButton = () => {
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSubmit = async () => {
    if (modalData !== undefined && modalData !== null) {
      await dataHandler(modalData);
    }

    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={handleModalCloseButton}
      size='xl'
      isCentered
      motionPreset='slideInBottom'
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader />
        <ModalBody>
          <Box mb={30}>
            {modalData !== undefined && modalData !== null && (
              <Flex
                w='full'
                h='full'
                alignItems='center'
                justifyContent='center'
              >
                <Stack spacing={{ base: 6, md: 10 }}>
                  <Stack spacing={{ base: 4, sm: 6 }} direction='column'>
                    <Text>Are you sure you want to delete the session?</Text>
                  </Stack>
                </Stack>
              </Flex>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            bg='cyan.700'
            key='close-button'
            color='white'
            w='100px'
            mr={5}
            size='md'
            onClick={handleModalCloseButton}
            _hover={{ bg: 'cyan.800' }}
          >
            Close
          </Button>
          <Button
            bg='red.500'
            key='submit-button'
            color='white'
            w='100px'
            size='md'
            onClick={handleSubmit}
            _hover={{ bg: 'red.800' }}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
