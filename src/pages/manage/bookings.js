import { Button, Box, Text, ButtonGroup, useToast } from "@chakra-ui/react";
import { CloseIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { cardVariant } from "@root/motion";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import Auth from "@components/Auth";
import TableWidget from "@components/TableWidget";
import BookingModal from "@components/BookingModal";

const MotionBox = motion(Box);

export default function ManageBooking() {
  const [modalData, setModalData] = useState(null);

  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState([]);

  var handleDetails = useCallback((content) => {
    setModalData(content);
  }, []);

  var handleCancel = useCallback(
    async (id) => {
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
    },
    [toast]
  );

  var includeActionButton = useCallback(
    async (content) => {
      for (let key in content) {
        if (content[key]) {
          const data = content[key];
          const buttons = await generateActionButton(data);
          data.action = buttons;
        }
      }
      setData(content);
    },
    [generateActionButton]
  );

  var generateActionButton = useCallback(
    async (content) => {
      let button = null;

      if (content.status === "PENDING" || content.status === "APPROVED") {
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
    },
    [handleDetails, handleCancel]
  );

  useEffect(() => {
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
          await includeActionButton(content.msg);
        }

        setLoadingData(false);
      } catch (error) {
        console.log(error);
      }
    };

    if (loadingData) {
      fetchData();
    }
  }, [includeActionButton, loadingData]);

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
    <Auth>
      <Box bg="white" borderRadius="lg" p={8} color="gray.700" shadow="base">
        <MotionBox variants={cardVariant} key="1">
          {loadingData ? (
            <Text>Loading Please wait...</Text>
          ) : (
            <TableWidget key={1} columns={columns} data={data} />
          )}
          <BookingModal
            isAdmin={false}
            isOpen={modalData ? true : false}
            onClose={() => setModalData(null)}
            modalData={modalData}
          />
        </MotionBox>
      </Box>
    </Auth>
  );
}
