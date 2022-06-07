import GoogleMapReact from "google-map-react";
import {
  Icon,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Stack,
} from "@chakra-ui/react";
import { MdOutlineLocationOn } from "react-icons/md";
import NextLink from "next/link";

export default function Map({ location, zoomLevel, apiKey }) {
  const link = `https://www.google.com/maps/place/King+Edward+VII+Hall/@1.2917278,103.7793973,17.78z/data=!4m13!1m7!3m6!1s0x31da1a537ee6f6a1:0xee8dab3ba6145082!2s1A+Kent+Ridge+Rd,+Singapore+119224!3b1!8m2!3d1.2913725!4d103.7814653!3m4!1s0x31da1a547778d745:0xdaf702fb4bb699f0!8m2!3d1.2923789!4d103.7810051`;

  const LocationPin = ({ text }) => (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Icon as={MdOutlineLocationOn} width={20} height={24} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Box>
            <Stack>
              <Box>{text}</Box>
              <Box>
                <NextLink href={link}>More details</NextLink>
              </Box>
            </Stack>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="map">
      <div className="google-map">
        <GoogleMapReact
          bootstrapURLKeys={{ key: apiKey }}
          defaultCenter={location}
          defaultZoom={zoomLevel}
        >
          <LocationPin
            lat={location.lat}
            lng={location.lng}
            text={location.address}
          />
        </GoogleMapReact>
      </div>
    </div>
  );
}
