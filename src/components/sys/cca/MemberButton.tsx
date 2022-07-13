import React, { useState } from 'react';
import { Button, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react';

export default function MemberButton({
  reality,
  handleClick,
  newKey,
  id,
  name,
  realityHours,
}) {
  const [selected, setSelected] = useState(false);
  const [hours, setHours] = useState(realityHours);

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
            value={hours}
            size='lg'
            onChange={(event) => {
              if (event.cancelable) {
                event.preventDefault();
              }
              setHours(Number(event.currentTarget.value));
              handleClick(id, name, Number(event.currentTarget.value));
            }}
          />
        </FormControl>
      )}
    </Stack>
  );
}
