import React from 'react';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Stack,
  Text,
  Spinner,
} from '@chakra-ui/react';

export default function LoadingModal({ isOpen, onClose }) {
  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      size='md'
      isCentered
      motionPreset='slideInBottom'
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalBody>
          <Box>
            <Stack mx='auto' maxW='lg' py={6} px={6}>
              <Stack align='center'>
                <Text fontSize='sm' color='gray.600'>
                  Submitting request... Please wait a few moment
                </Text>
                <Spinner />
              </Stack>
            </Stack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
