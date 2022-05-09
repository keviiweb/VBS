import React, { useState } from "react";
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  CircularProgress,
} from "@chakra-ui/core";
import { signIn } from "next-auth/react";
import * as yup from 'yup';
import { useForm } from "react-hook-form";

const schema = yup.object().shape({
  email: yup.string().email().required(),
});

export default function Login() {

  const { register, handleSubmit } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await signIn("email", { email: email });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        p={8}
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
        <Box textAlign="center">
          <Heading>KEVII VBS</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                ref={register}
                type="email"
                placeholder="test@test.com"
                size="lg"
              />
            </FormControl>
            <Button
              variantColor="teal"
              variant="outline"
              type="submit"
              width="full"
              mt={4}
            >
              {isLoading ? (
                <CircularProgress isIndeterminate size="24px" color="teal" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Box>
      </Box>
    </Flex>
  );
}
