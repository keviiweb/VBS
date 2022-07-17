import React from 'react';
import { TableBodyProps, Tbody as ChakraTbody } from '@chakra-ui/react';

export default function Tbody(props: TableBodyProps) {
  return <ChakraTbody {...props} />;
}
