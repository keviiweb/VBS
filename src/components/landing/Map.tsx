import GoogleMapReact from 'google-map-react';
import {
  Image,
  Box,
  Popover,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  Stack,
  Link,
  usePopoverContext,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';

import { PopoverTriggerProps } from 'types/popover';
import { checkerString } from '@constants/sys/helper';

const PopoverTriggerNew: React.FC<
  React.PropsWithChildren<PopoverTriggerProps>
> = (props) => {
  // enforce a single child
  const child: any = React.Children.only(props.children);
  const { getTriggerProps } = usePopoverContext();
  return React.cloneElement(child, getTriggerProps(child.props, child.ref));
};

/**
 * Renders a Google Map component with specific data
 *
 * @param param0 Map Location and API Key
 * @returns Google Maps Component
 */
export default function Map({ location, zoomLevel, apiKey }) {
  const link =
    'https://www.google.com/maps/place/King+Edward+VII+Hall/@1.2917278,103.7793973,17.78z/data=!4m13!1m7!3m6!1s0x31da1a537ee6f6a1:0xee8dab3ba6145082!2s1A+Kent+Ridge+Rd,+Singapore+119224!3b1!8m2!3d1.2913725!4d103.7814653!3m4!1s0x31da1a547778d745:0xdaf702fb4bb699f0!8m2!3d1.2923789!4d103.7810051';

  const getMapOptions = (maps) => ({
    streetViewControl: false,
    scaleControl: false,
    fullscreenControl: false,
    mapTypeId: maps.MapTypeId.HYBRID,
    zoomControl: true,
    clickableIcons: false,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: maps.ControlPosition.BOTTOM_CENTER,
      mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.HYBRID],
    },
  });

  const LocationPin = useCallback(
    ({ text }) => (
      <Popover offset={[0, 10]} placement='top'>
        <PopoverTriggerNew>
          <Image w={10} h={12} src='/landing/marker.png' />
        </PopoverTriggerNew>
        <PopoverContent>
          <PopoverCloseButton />
          <PopoverBody>
            <Box>
              <Stack>
                <Box>{text}</Box>
                <Box>
                  <Link href={link} isExternal>
                    More details
                  </Link>
                </Box>
              </Stack>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    ),
    [],
  );

  return (
    <div className='map'>
      <div className='google-map'>
        {checkerString(apiKey) && (
          <GoogleMapReact
            bootstrapURLKeys={{ key: apiKey }}
            defaultCenter={location}
            defaultZoom={zoomLevel}
            options={getMapOptions}
          >
            <LocationPin text={location.address} />
          </GoogleMapReact>
        )}
      </div>
    </div>
  );
}
