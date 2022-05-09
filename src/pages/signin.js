import * as React from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  Center, 
  Flex
} from "@chakra-ui/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  email: yup.string().email().required()
});

export default function LoginForm() {
  const { register, handleSubmit, errors } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });

  const onSubmit = (values) => console.log(values.email);

  return (
      <Flex justify="center" h="100vh" w="100vw" align="center">
      <Center w="100%">
      <form style={{ width: 350 }}>
      <FormControl
        p="4"
        isRequired
      >
        <FormLabel>Email</FormLabel>
        <Input type="email" name="email" placeholder="Email" ref={register} />
        <FormHelperText>
          Please use your school email ending with @u.nus.edu
        </FormHelperText>
      </FormControl>  
      <Button
        onClick={handleSubmit(onSubmit)}
        p="4"
        mx="4"
        mt="6"
        w="90%"
        colorScheme="blue"
        variant="solid"
      >
        Login
      </Button>
    </form>
      </Center>
    </Flex>

   
  );
}
