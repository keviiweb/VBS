import {
  Button,
  Box,
  Heading,
  FormControl,
  Input,
  FormLabel,
  Flex,
  Icon,
  Text,
  Stack,
  useColorModeValue,
  ButtonGroup,
  Checkbox,
  Select,
  useToast,
  chakra,
  VisuallyHidden,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { cardVariant } from "@root/motion";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import Auth from "@components/Auth";
import TableWidget from "@components/TableWidget";
import VenueModal from "@components/VenueModal";
import { timeSlots } from "@constants/timeslot";

const MotionBox = motion(Box);

export default function ManageVenues() {
  const [modalData, setModalData] = useState(null);
  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState([]);

  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [instantBook, setInstantBook] = useState(false);
  const [isChildVenue, setIsChildVenue] = useState(false);
  const [visible, setVisible] = useState(false);

  const nameDB = useRef(null);
  const descriptionDB = useRef(null);
  const capacityDB = useRef(null);
  const instantBookDB = useRef(null);
  const isChildVenueDB = useRef(null);
  const visibleDB = useRef(null);

  const [parentVenueDropdown, setParentVenueDropdown] = useState([]);
  const parentVenue = useRef(null);

  const startTime = useRef(null);
  const endTime = useRef(null);
  const [startTimeDropdown, setStartTimeDropdown] = useState([]);
  const [endTimeDropdown, setEndTimeDropdown] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const selectedFileDB = useRef(null);

  const handleDetails = (content) => {
    setModalData(content);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFileDB.current) {
      const openingHours = startTime + " - " + endTime;
      if (
        validateFields(
          nameDB.current,
          descriptionDB.current.capacityDB.current,
          instantBookDB.current,
          visibleDB.current,
          isChildVenueDB.current,
          parentVenue.current,
          openingHours
        )
      ) {
        const data = new FormData();
        data.append("image", selectedFileDB.current);
        data.append("name", nameDB.current);
        data.append("description", descriptionDB.current);
        data.append("capacity", capacityDB.current);
        data.append("isInstantBook", instantBookDB.current);
        data.append("visible", visibleDB.current);
        data.append("isChildVenue", isChildVenueDB.current);
        data.append("parentVenue", parentVenue.current);
        data.append("openingHours", openingHours);

        try {
          const rawResponse = await fetch("/api/venue/create", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: data,
          });
          const content = await rawResponse.json();
          if (content.status) {
            toast({
              title: "Success",
              description: content.msg,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Error",
              description: content.error,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (error) {}
      }
    } else {
    }
  };

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    selectedFileDB.current = file;
    setSelectedFile(file);
  };

  const onParentVenueChange = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      parentVenue.current = value;
    }
  };

  const onStartTimeChange = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      startTime.current = value;
    }
  };

  const onEndTimeChange = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      endTime.current = value;
    }
  };

  const includeActionButton = async (content) => {
    const selection = [];
    let count = 0;

    for (let key in content) {
      if (content[key]) {
        const data = content[key];
        if (!data.isChildVenue) {
          selection.push(
            <option key={data.id} value={data.id}>
              {data.name}
            </option>
          );

          if (count == 0) {
            parentVenue.current = data.id;
            count++;
          }
        }
        const buttons = await generateActionButton(data);
        data.action = buttons;
      }
    }

    setParentVenueDropdown(selection);
    setData(content);
  };

  const generateActionButton = async (content) => {
    let button = null;

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
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const rawResponse = await fetch("/api/venue/fetch", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
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

      const start = [];
      const end = [];

      for (let key in timeSlots) {
        if (timeSlots[key]) {
          const data = timeSlots[key];
          start.push(
            <option key={"start" + key} value={data}>
              {data}
            </option>
          );

          end.push(
            <option key={"end" + key} value={data}>
              {data}
            </option>
          );
        }
      }

      setStartTimeDropdown(start);
      setEndTimeDropdown(end);

      startTime.current = "0700";
      endTime.current = "0700";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingData]);

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Opening Hours",
        accessor: "openingHours",
      },
      {
        Header: "Capacity",
        accessor: "capacity",
      },
      {
        Header: "Child Venue",
        accessor: "childVenue",
      },
      {
        Header: "Available for Booking",
        accessor: "isAvailable",
      },
      {
        Header: "Actions",
        accessor: "action",
      },
    ],
    []
  );

  const validateFields = (
    name,
    description,
    capacity,
    isInstantBook,
    visible,
    isChildVenue,
    parentVenue,
    openingHours
  ) => {
    //super basic validation here
    if (!name) {
      return false;
    }

    if (!description) {
      return false;
    }

    if (!capacity) {
      return false;
    }

    if (isInstantBook == null) {
      return false;
    }

    if (visible == null) {
      return false;
    }

    if (isChildVenue == null) {
      return false;
    }

    if (isChildVenue && !parentVenue) {
      return false;
    }

    if (!openingHours) {
      return false;
    }

    return true;
  };

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
            <TableWidget key={1} columns={columns} data={data} />
          )}
          <VenueModal
            isOpen={modalData ? true : false}
            onClose={() => setModalData(null)}
            modalData={modalData}
          />
        </MotionBox>
      </Box>

      <Stack
        spacing={4}
        w={"full"}
        maxW={"md"}
        bg={useColorModeValue("white", "gray.700")}
        rounded={"xl"}
        boxShadow={"lg"}
        p={6}
        my={12}
      >
        <Heading size="md">Create new venue</Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="name">
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                placeholder="Name"
                size="lg"
                onChange={(event) => {
                  setName(event.currentTarget.value);
                  nameDB.current = event.currentTarget.value;
                }}
              />
            </FormControl>
            <FormControl id="description">
              <FormLabel>Description</FormLabel>
              <Input
                type="text"
                placeholder="Description"
                size="lg"
                onChange={(event) => {
                  setDescription(event.currentTarget.value);
                  descriptionDB.current = event.currentTarget.value;
                }}
              />
            </FormControl>
            <FormControl id="capacity">
              <FormLabel>Capacity</FormLabel>
              <Input
                type="number"
                placeholder="Capacity"
                size="lg"
                onChange={(event) => {
                  setCapacity(event.currentTarget.value);
                  capacityDB.current = event.currentTarget.value;
                }}
              />
            </FormControl>
            {startTimeDropdown && (
              <Stack spacing={5} w="full">
                <Text>Start Time</Text>
                <Select onChange={onStartTimeChange} size="sm">
                  {endTimeDropdown}
                </Select>
              </Stack>
            )}

            {endTimeDropdown && (
              <Stack spacing={5} w="full">
                <Text>End Time</Text>
                <Select onChange={onEndTimeChange} size="sm">
                  {endTimeDropdown}
                </Select>
              </Stack>
            )}

            <Stack spacing={5} direction="row">
              <Checkbox
                isChecked={visible}
                onChange={(event) => {
                  setVisible(event.target.checked);
                  visibleDB.current = event.target.checked;
                }}
              >
                Visible
              </Checkbox>
              <Checkbox
                isChecked={instantBook}
                onChange={(event) => {
                  setInstantBook(event.target.checked);
                  instantBookDB.current = event.target.checked;
                }}
              >
                Instant Book
              </Checkbox>
              <Checkbox
                isChecked={isChildVenue}
                onChange={(event) => {
                  setIsChildVenue(event.target.checked);
                  isChildVenueDB.current = event.target.checked;
                }}
              >
                Child Venue
              </Checkbox>
            </Stack>
            {isChildVenue && (
              <Stack spacing={5} w="full">
                <Text>Select Venue</Text>
                <Select onChange={onParentVenueChange} size="sm">
                  {parentVenueDropdown}
                </Select>
              </Stack>
            )}

            <FormControl>
              <FormLabel
                fontSize="sm"
                fontWeight="md"
                color={useColorModeValue("gray.700", "gray.50")}
              >
                Venue photo
              </FormLabel>
              <Flex
                mt={1}
                justify="center"
                px={6}
                pt={5}
                pb={6}
                borderWidth={2}
                borderColor={useColorModeValue("gray.300", "gray.500")}
                borderStyle="dashed"
                rounded="md"
              >
                <Stack spacing={1} textAlign="center">
                  <Icon
                    mx="auto"
                    boxSize={12}
                    color={useColorModeValue("gray.400", "gray.500")}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Icon>
                  <Flex
                    fontSize="sm"
                    color={useColorModeValue("gray.600", "gray.400")}
                    alignItems="baseline"
                  >
                    <chakra.label
                      htmlFor="file-upload"
                      cursor="pointer"
                      rounded="md"
                      fontSize="md"
                      color={useColorModeValue("brand.600", "brand.200")}
                      pos="relative"
                      _hover={{
                        color: useColorModeValue("brand.400", "brand.300"),
                      }}
                    >
                      <span>Upload a file</span>
                      <VisuallyHidden>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          onChange={onFileChange}
                        />
                      </VisuallyHidden>
                    </chakra.label>
                    <Text pl={1}>or drag and drop</Text>
                  </Flex>
                  <Text
                    fontSize="xs"
                    color={useColorModeValue("gray.500", "gray.50")}
                  >
                    PNG, JPG, GIF up to 10MB
                  </Text>
                </Stack>
              </Flex>
            </FormControl>

            <Stack spacing={10}>
              <Button
                type="submit"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Create
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Auth>
  );
}
