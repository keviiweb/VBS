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
  useBreakpointValue
} from '@chakra-ui/react';

/**
 * Renders a modal with a loading spinner and message
 *
 * This modal is used to block out all buttons and display a message to the user
 *
 * @param param0 Modal functions
 * @returns A loading modal
 */
export default function LoadingModal ({ isOpen, onClose }) {
  const variant = useBreakpointValue({ base: 'xs', md: 'md' });

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      size={variant}
      isCentered
      motionPreset='slideInBottom'
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalBody>
          <Box>
            <Stack mx='auto' maxW='lg' px={6}>
              <Stack align='center' textAlign='center'>
                <Text fontSize='sm' color='gray.600'>
                  Submitting request...
                </Text>
                <Text fontSize='sm' color='gray.600'>
                  Please wait a few moment
                </Text>

                <Stack spacing={10}>
                  <Spinner mb={10} />
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
