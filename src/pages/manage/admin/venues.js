import {
  Button,
  Box,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  ButtonGroup,
  useToast,
} from "@chakra-ui/react";
import { cardVariant } from "@root/motion";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import Auth from "@components/Auth";
import BookingTable from "@components/BookingTable";

const MotionBox = motion(Box);

export default function ManageVenues() {
  const toast = useToast();

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Opening Hours",
        accessor: "openingHours",
      },
      {
        Header: "Capacity",
        accessor: "capacity",
      },
    ],
    []
  );

  useEffect(() => {}, []);

  return (
    <Auth admin>
      <Box
        bg={useColorModeValue("white", "gray.700")}
        borderRadius="lg"
        p={8}
        color={useColorModeValue("gray.700", "whiteAlpha.900")}
        shadow="base"
      >
        <MotionBox variants={cardVariant} key="1"></MotionBox>
      </Box>
    </Auth>
  );
}
