import React, { useState } from 'react';
import { Button, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react';
import { checkerString } from '@constants/sys/helper';

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
      {checkerString(name) && (
        <Button
          disabled={reality}
          colorScheme='gray'
          variant='solid'
          size='md'
          margin='8px'
          key={newKey}
          onClick={async () => await click()}
        >
          {name}
        </Button>
      )}

      {reality && (
        <FormControl id='hours'>
          {checkerString(name) && <FormLabel>Hours for {name}</FormLabel>}

          <Input
            type='text'
            placeholder={`Hours for ${name}`}
            size='lg'
            onChange={(event) => {
              if (event.cancelable) {
                event.preventDefault();
              }

              if (
                event.currentTarget.value !== null &&
                event.currentTarget.value !== undefined
              ) {
                handleClick(id, name, Number(event.currentTarget.value));
              }
            }}
          />
        </FormControl>
      )}
    </Stack>
  );
}
