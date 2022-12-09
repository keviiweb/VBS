import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { Result } from 'types/api';
import LoadingModal from '@components/sys/misc/LoadingModal';
import { useRouter } from 'next/router';

/**
 * Renders a component whenever user have not accepted the terms and conditions first, this is a
 * one-time process
 *
 * @returns Accept Terms Page
 */
export default function AcceptTerms () {
  const toast = useToast();

  const router = useRouter();

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);
  const [isSubmitting, setIsSubmit] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (acceptedTerms) {
      setTimeout(() => {
        router.push('/sys');
      }, 500);
    }
  }, [router, acceptedTerms]);

  const handleAccept = useCallback(async () => {
    setSubmitButtonPressed(true);
    setIsSubmit(true);
    setAcceptedTerms(false);
    try {
      const rawResponse = await fetch('/api/user/accept', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        toast({
          title: 'Success',
          description: content.msg,
          status: 'success',
          isClosable: true
        });
        setAcceptedTerms(true);
      } else {
        toast({
          title: 'Error',
          description: content.error,
          status: 'error',
          duration: 5000,
          isClosable: true
        });

        setIsSubmit(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmit(false);
    }

    setSubmitButtonPressed(false);
  }, [toast]);

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <LoadingModal
        isOpen={!!submitButtonPressed}
        onClose={() => setSubmitButtonPressed(false)}
      />

      <Stack mx='auto' maxW='lg' py={12} px={6}>
        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <Stack align='center'>
            <Heading fontSize='4xl'>Terms and Conditions</Heading>
          </Stack>

          <Text
            style={{ whiteSpace: 'pre-line' }}
            mt={7}
            fontSize='md'
            color='gray.600'
          >
            By continuing with this web application, you are giving KEWeb your
            consent to store your personal details such as email address, and
            sensitive information such as KEIPS. All personal information will
            be kept confidential and will be used only for the web application
            functionalities.
            {'\n'}
            {'\n'}
            Should you wish to withdraw your consent and authorization to use
            the internal VBS, please email the following address:
            ke7webdev@gmail.com or contact @heriobraker on Telegram. We will
            then remove your personal information from our database.
            {'\n'}
            {'\n'}
            By clicking &apos;Accept&apos;, you have read and acknowledged the
            above paragraph.
          </Text>
          <Button
            disabled={isSubmitting}
            key='accept-button'
            bg='blue.400'
            color='white'
            w='150px'
            size='lg'
            _hover={{ bg: 'blue.600' }}
            mt={5}
            onClick={async () => {
              await handleAccept();
            }}
          >
            Accept
          </Button>
        </Box>
      </Stack>
    </Flex>
  );
}
