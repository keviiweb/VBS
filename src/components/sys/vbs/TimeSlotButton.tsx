import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';

/**
 * TimeSlot button used for creating a new Venue Booking
 *
 * @param param0 List of functions available
 * @returns Renders a clickable button that represents a particular timeslot
 */
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
    if (handleClick !== null && handleClick !== undefined) {
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
      onClick={() => click()}
    >
      {slot}
    </Button>
  );
}
