import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button
} from '@chakra-ui/react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signIn } from "next-auth/react";

const schema = yup.object().shape({
  email: yup.string().email().required(),
});

export default function LoginForm() {
  const { register, handleSubmit } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onSubmit = (values) => signIn("email", { email: values.email });;

  return (
    <form style={{ width: 350 }}>
      <FormControl
        p='4'
        isRequired
      >
        <FormLabel>Email</FormLabel>
        <Input type='email' name='email' placeholder='Email' ref={register} />
        <FormHelperText>
          Please enter your school email ending with @u.nus.edu
        </FormHelperText>
      </FormControl>
      <Button
        onClick={handleSubmit(onSubmit)}
        p='4'
        mx='4'
        mt='6'
        w='90%'
        colorScheme='blue'
        variant='solid'
      >
        Login
      </Button>
    </form>
  );
}