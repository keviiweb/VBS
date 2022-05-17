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
import { CheckIcon, CloseIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { cardVariant } from "@root/motion";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import Auth from "@components/Auth";
import TableWidget from "@components/TableWidget";
import BookingModal from "@components/BookingModal";

const MotionBox = motion(Box);

export default function ManageBooking() {
  const [modalData, setModalData] = useState(null);

  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState(null);
  const allBookings = useRef([]);
  const ALL = 3;
  const PENDING = 0;
  const APPROVED = 1;
  const REJECTED = 2;

  const [tabIndex, setTabIndex] = useState(0);
  const tabIndexData = useRef(0);

  const handleTabChange = async (index) => {
    tabIndexData.current = index;
    setTabIndex(index);
    setData(null);
    switch (index) {
      case PENDING:
        await fetchPendingData();
        break;
      case APPROVED:
        await fetchApprovedData();
        break;
      case REJECTED:
        await fetchRejectedData();
        break;
      case ALL:
        await fetchAllData();
        break;
    }
  };

  const handleApprove = async (id) => {
    if (id) {
      try {
        const rawResponse = await fetch("/api/bookingReq/approve", {
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
            title: "Request approved.",
            description: "An email has been sent to the requester",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          await handleTabChange(tabIndexData.current);
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

  const handleReject = async (id) => {
    if (id) {
      try {
        const rawResponse = await fetch("/api/bookingReq/reject", {
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
            title: "Request rejected.",
            description: "An email has been sent to the requester",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          await handleTabChange(tabIndexData.current);
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

  const handleDetails = (content) => {
    setModalData(content);
  };

  const includeActionButton = async (content, action) => {
    for (let key in content) {
      if (content[key]) {
        const data = content[key];
        const buttons = await generateActionButton(data, action);
        data.action = buttons;
      }
    }
    setData(content);
  };

  const generateActionButton = async (content, action) => {
    let button = null;

    switch (action) {
      case ALL:
        if (content.status === "PENDING") {
          button = (
            <ButtonGroup>
              <Button
                size="sm"
                leftIcon={<CheckIcon />}
                onClick={() => handleApprove(content.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                leftIcon={<CloseIcon />}
                onClick={() => handleReject(content.id)}
              >
                Reject
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
      case APPROVED:
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
      case REJECTED:
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
      case PENDING:
        if (content.status === "PENDING") {
          button = (
            <ButtonGroup>
              <Button
                size="sm"
                leftIcon={<CheckIcon />}
                onClick={() => handleApprove(content.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                leftIcon={<CloseIcon />}
                onClick={() => handleReject(content.id)}
              >
                Reject
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
    }
  };

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const rawResponse = await fetch("/api/bookingReq/fetch", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        allBookings.current = content.msg;
        await includeActionButton(content.msg, ALL);
        setLoadingData(false);
      } else {
        setData(null);
        setLoadingData(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchApprovedData = async () => {
    setLoadingData(true);
    try {
      const rawResponse = await fetch("/api/bookingReq/fetch?q=APPROVED", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        allBookings.current = content.msg;
        await includeActionButton(content.msg, APPROVED);
        setLoadingData(false);
      } else {
        setData(null);
        setLoadingData(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRejectedData = async () => {
    setLoadingData(true);
    try {
      const rawResponse = await fetch("/api/bookingReq/fetch?q=REJECTED", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        allBookings.current = content.msg;
        await includeActionButton(content.msg, REJECTED);
        setLoadingData(false);
      } else {
        setData(null);
        setLoadingData(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPendingData = async () => {
    setLoadingData(true);
    try {
      const rawResponse = await fetch("/api/bookingReq/fetch?q=PENDING", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        allBookings.current = content.msg;
        await includeActionButton(content.msg, PENDING);
        setLoadingData(false);
      } else {
        setData(null);
        setLoadingData(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPendingData();
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
        width={{ base: "full", md: "full", lg: "full" }}
        p={8}
        color={useColorModeValue("gray.700", "whiteAlpha.900")}
        shadow="base"
      >
        <MotionBox variants={cardVariant} key="1">
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            size={{ base: "md", md: "md", lg: "md" }}
            isManual
            isLazy
            isFitted
            variant="enclosed"
          >
            <TabList>
              <Tab>Pending Approval</Tab>
              <Tab>Approved</Tab>
              <Tab>Rejected</Tab>
              <Tab>All Bookings</Tab>
            </TabList>
            {loadingData && !data ? (
              <Text>Loading Please wait...</Text>
            ) : (
              <TableWidget key={1} columns={columns} data={data} />
            )}
            <BookingModal
              isAdmin={true}
              isOpen={modalData ? true : false}
              onClose={() => setModalData(null)}
              modalData={modalData}
            />
          </Tabs>
        </MotionBox>
      </Box>
    </Auth>
  );
}
