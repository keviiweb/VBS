import React from 'react';
import { TableRowProps, Tr as ChakraTr } from '@chakra-ui/react';
import { Consumer } from '@components/sys/misc/table/utils';

interface ITrInnerProps extends TableRowProps {}

function TrInner(props: ITrInnerProps) {
  const { children, ...rest } = props;

  const childProps = (idx: number) => ({ key: idx, columnKey: idx });

  return (
    <ChakraTr {...rest}>
      {children &&
        React.Children.map(
          children,
          (child, idx) =>
            React.isValidElement(child) &&
            React.cloneElement(child, childProps(idx)),
        )}
    </ChakraTr>
  );
}

export interface ITrProps extends Omit<ITrInnerProps, 'headers'> {}

export default function Tr(props: ITrProps) {
  return <Consumer>{() => <TrInner {...props} />}</Consumer>;
}
