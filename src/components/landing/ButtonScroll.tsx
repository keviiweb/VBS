import { Button, Image } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { animateScroll } from 'react-scroll';

/**
 * Renders a floating button on the landing page that brings the user to the top when pressed
 *
 * Also known as scroll-to-top button
 *
 * @returns A floating button
 */
export default function ButtonScrollTop () {
  const [show, setShow] = useState(false);
  const showStyle: Record<string, React.CSSProperties> = show
    ? {
      show: {
        opacity: 1,
        pointerEvents: 'auto'
      }
    }
    : {};

  function onScrollTop () {
    animateScroll.scrollToTop();
  }

  const onCheckScroll = useCallback(() => {
    try {
      if (!show && window.pageYOffset > 400) {
        setShow(true);
      } else if (show && window.pageYOffset <= 400) {
        setShow(false);
      }
    } catch (error) {
      console.error(error);
    }
  }, [show]);

  useEffect(() => {
    window.addEventListener('scroll', onCheckScroll);

    return () => { window.removeEventListener('scroll', onCheckScroll); };
  }, [onCheckScroll]);

  return (
    <Button
      onClick={() => { onScrollTop(); }}
      id='scrollButton'
      style={showStyle.show}
    >
      <Image src='/landing/arrow_down.svg' alt='Scroll to top' />
    </Button>
  );
}
