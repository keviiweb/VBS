import React from 'react';
import { TableHeadProps, Thead as ChakraThead } from '@chakra-ui/react';

export default function Thead(props: TableHeadProps) {
  const { children, ...rest } = props;

  return (
    <ChakraThead {...rest}>
      {React.isValidElement(children) && React.cloneElement(children)}
    </ChakraThead>
  );
}
