import React from 'react';
import { TableCellProps, Td as ChakraTd } from '@chakra-ui/react';
import { Consumer } from '@components/sys/misc/table/utils';

interface ITdInnerProps extends TableCellProps {
  narrowHeaders: Record<number, any>;
}

function TdInner(props: ITdInnerProps) {
  const { ...rest } = props;
  const { className, children } = props;
  const classes = `${className || ''} pivoted`;

  return (
    <ChakraTd data-testid='td' {...rest} className={classes}>
      {children ?? <div>&nbsp;</div>}
    </ChakraTd>
  );
}

export interface ITdProps extends Omit<ITdInnerProps, 'narrowHeaders'> {}

export default function Td(props: ITdProps) {
  return (
    <Consumer>
      {(headers) => <TdInner {...props} narrowHeaders={headers} />}
    </Consumer>
  );
}
