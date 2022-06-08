import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';

export default function TimeSlotButton({
  disable,
  handleClick,
  newKey,
  id,
  slot,
}) {
  const [selected, setSelected] = useState(false);

  const click = async () => {
    setSelected(!selected);
    if (handleClick) {
      await handleClick(id);
    }
  };

  return (
    <Button
      isDisabled={disable}
      colorScheme='gray'
      variant={selected ? 'solid' : 'outline'}
      size='sm'
      margin='8px'
      key={newKey}
      onClick={async () => await click()}
    >
      {slot}
    </Button>
  );
}
