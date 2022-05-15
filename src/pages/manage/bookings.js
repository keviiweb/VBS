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
import { CloseIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { cardVariant } from "@root/motion";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import Auth from "@components/Auth";
import BookingTable from "@components/BookingTable";
import BookingModal from "@components/BookingModal";

const MotionBox = motion(Box);

export default function ManageBooking() {
  const [modalData, setModalData] = useState(null);

  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState([]);
  const allBookings = useRef([]);

  const handleDetails = (content) => {
    setModalData(content);
  };

  const handleCancel = async (id) => {
    if (id) {
      try {
        const rawResponse = await fetch("/api/bookingReq/cancel", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
          }),
        });
        const content = await rawResponse.json();
        if (content.status) {
          toast({
            title: "Request cancelled.",
            description: "An email has been sent to the requester",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          await fetchData();
        } else {
          toast({
            title: "Error",
            description: content.error,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const includeActionButton = async (content) => {
    for (let key in content) {
      if (content[key]) {
        const data = content[key];
        const buttons = await generateActionButton(data);
        data.action = buttons;
      }
    }
    setData(content);
  };

  const generateActionButton = async (content) => {
    let button = null;

    if (content.status === "PENDING") {
      button = (
        <ButtonGroup>
          <Button
            size="sm"
            leftIcon={<CloseIcon />}
            onClick={() => handleCancel(content.id)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon={<InfoOutlineIcon />}
            onClick={() => handleDetails(content)}
          >
            View Details
          </Button>
        </ButtonGroup>
      );
      return button;
    } else {
      button = (
        <ButtonGroup>
          <Button
            size="sm"
            leftIcon={<InfoOutlineIcon />}
            onClick={() => handleDetails(content)}
          >
            View Details
          </Button>
        </ButtonGroup>
      );
      return button;
    }
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const rawResponse = await fetch("/api/bookingReq/fetch?q=USER", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        allBookings.current = content.msg;
        await includeActionButton(content.msg);
        setLoadingData(false);
      } else {
        setData([]);
        setLoadingData(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (loadingData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Venue",
        accessor: "venue",
      },
      {
        Header: "Date",
        accessor: "date",
      },
      {
        Header: "Timeslot(s)",
        accessor: "timeSlots",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "CCA",
        accessor: "cca",
      },
      {
        Header: "Purpose",
        accessor: "purpose",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "Actions",
        accessor: "action",
      },
    ],
    []
  );

  return (
    <Auth admin>
      <Box
        bg={useColorModeValue("white", "gray.700")}
        borderRadius="lg"
        p={8}
        color={useColorModeValue("gray.700", "whiteAlpha.900")}
        shadow="base"
      >
        <MotionBox variants={cardVariant} key="1">
          {loadingData ? (
            <Text>Loading Please wait...</Text>
          ) : (
            <BookingTable key={1} columns={columns} data={data} />
          )}
          <BookingModal
            isOpen={modalData ? true : false}
            onClose={() => setModalData(null)}
            modalData={modalData}
          />
        </MotionBox>
      </Box>
    </Auth>
  );
}
