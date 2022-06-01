import {
  Button,
  Box,
  Text,
  Tabs,
  TabList,
  Tab,
  ButtonGroup,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { cardVariant } from "@root/motion";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Auth from "@components/Auth";
import TableWidget from "@components/TableWidget";
import BookingModal from "@components/BookingModal";

const MotionBox = motion(Box);

export default function ManageBooking() {
  const [modalData, setModalData] = useState(null);

  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState(null);
  const ALL = 3;
  const PENDING = 0;
  const APPROVED = 1;
  const REJECTED = 2;

  const [tabIndex, setTabIndex] = useState(0);
  const tabIndexData = useRef(0);

  var handleTabChange = useCallback(
    async (index) => {
      tabIndexData.current = index;
      setTabIndex(index);
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
        default:
          break;
      }
    },
    [fetchPendingData, fetchApprovedData, fetchAllData, fetchRejectedData]
  );

  var handleApprove = useCallback(
    async (id) => {
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
    },
    [handleTabChange, toast]
  );

  var handleReject = useCallback(
    async (id) => {
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
    },
    [handleTabChange, toast]
  );

  var handleDetails = useCallback((content) => {
    setModalData(content);
  }, []);

  var includeActionButton = useCallback(
    async (content, action) => {
      for (let key in content) {
        if (content[key]) {
          const data = content[key];
          const buttons = await generateActionButton(data, action);
          data.action = buttons;
        }
      }
      setData(content);
    },
    [generateActionButton]
  );

  var generateActionButton = useCallback(
    async (content, action) => {
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
    },
    [handleApprove, handleDetails, handleReject]
  );

  var fetchAllData = useCallback(async () => {
    setLoadingData(true);
    setData(null);
    try {
      const rawResponse = await fetch("/api/bookingReq/fetch", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, ALL);
      }

      setLoadingData(false);
    } catch (error) {
      console.log(error);
    }
  }, [includeActionButton]);

  var fetchApprovedData = useCallback(async () => {
    setLoadingData(true);
    setData(null);
    try {
      const rawResponse = await fetch("/api/bookingReq/fetch?q=APPROVED", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, APPROVED);
      }

      setLoadingData(false);
    } catch (error) {
      console.log(error);
    }
  }, [includeActionButton]);

  var fetchRejectedData = useCallback(async () => {
    setLoadingData(true);
    setData(null);

    try {
      const rawResponse = await fetch("/api/bookingReq/fetch?q=REJECTED", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, REJECTED);
      }
      setLoadingData(false);
    } catch (error) {
      console.log(error);
    }
  }, [includeActionButton]);

  var fetchPendingData = useCallback(async () => {
    setLoadingData(true);
    setData(null);
    try {
      const rawResponse = await fetch("/api/bookingReq/fetch?q=PENDING", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg, PENDING);
      }
      setLoadingData(false);
    } catch (error) {
      console.log(error);
    }
  }, [includeActionButton]);

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

  useEffect(() => {
    fetchPendingData();
  }, [fetchPendingData]);

  return (
    <Auth admin>
      <Box
        bg="white"
        borderRadius="lg"
        width={{ base: "full", md: "full", lg: "full" }}
        p={8}
        color="gray.700"
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
              <Box align="center" justify="center" mt={30}>
                <Text>Loading Please wait...</Text>
              </Box>
            ) : !loadingData && data.length == 0 ? (
              <Box align="center" justify="center" mt={30}>
                <Text>No bookings found</Text>
              </Box>
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
