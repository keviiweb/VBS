import React from 'react';
import { TableColumnHeaderProps, Th as ChakraTh } from '@chakra-ui/react';

export default function Th(props: TableColumnHeaderProps) {
  return <ChakraTh {...props} />;
}
