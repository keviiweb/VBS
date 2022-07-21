import React, { useState } from 'react';
import { Button, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react';

/**
 * Member button used for selecting an expected member
 *
 * @param param0 List of functions available
 * @returns Renders a clickable button that represents a particular member
 */
export default function MemberButton({
  reality,
  handleClick,
  newKey,
  id,
  name,
}) {
  const [selected, setSelected] = useState(false);

  const click = async () => {
    if (handleClick !== null && handleClick !== undefined && !reality) {
      setSelected(!selected);
      await handleClick(id);
    }
  };

  return (
    <Stack direction='column'>
      <Button
        disabled={reality}
        colorScheme='gray'
        variant='solid'
        size='md'
        margin='8px'
        key={newKey}
        onClick={() => click()}
      >
        {name}
      </Button>

      {reality && (
        <FormControl id='hours'>
          <FormLabel>Hours for {name}</FormLabel>
          <Input
            type='number'
            placeholder='Hours'
            step={0.1}
            size='lg'
            onChange={(event) => {
              if (event.cancelable) {
                event.preventDefault();
              }
              handleClick(id, name, Number(event.currentTarget.value));
            }}
          />
        </FormControl>
      )}
    </Stack>
  );
}
