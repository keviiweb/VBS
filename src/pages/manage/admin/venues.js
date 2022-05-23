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
  ButtonGroup,
  Checkbox,
  Select,
  useToast,
  chakra,
  VisuallyHidden,
  SimpleGrid,
} from "@chakra-ui/react";

import { InfoOutlineIcon } from "@chakra-ui/icons";
import { cardVariant, parentVariant } from "@root/motion";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Auth from "@components/Auth";
import TableWidget from "@components/TableWidget";
import VenueModal from "@components/VenueModal";
import { timeSlots } from "@constants/timeslot";

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function ManageVenues() {
  const [modalData, setModalData] = useState(null);
  const toast = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [instantBook, setInstantBook] = useState(false);
  const [isChildVenue, setIsChildVenue] = useState(false);
  const [visible, setVisible] = useState(true);

  const nameDB = useRef("");
  const descriptionDB = useRef("");
  const capacityDB = useRef("");
  const instantBookDB = useRef(false);
  const isChildVenueDB = useRef(false);
  const visibleDB = useRef(true);

  const [parentVenueDropdown, setParentVenueDropdown] = useState([]);
  const parentVenue = useRef(null);

  const startTimeDB = useRef(null);
  const endTimeDB = useRef(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startTimeDropdown, setStartTimeDropdown] = useState([]);
  const [endTimeDropdown, setEndTimeDropdown] = useState([]);

  const selectedFileDB = useRef(null);
  const [fileName, setFileName] = useState(null);

  const [error, setError] = useState(null);

  //Edits
  const [nameEdit, setNameEdit] = useState("");
  const [descriptionEdit, setDescriptionEdit] = useState("");
  const [capacityEdit, setCapacityEdit] = useState("");
  const [instantBookEdit, setInstantBookEdit] = useState(false);
  const [isChildVenueEdit, setIsChildVenueEdit] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(true);

  const nameDBEdit = useRef("");
  const descriptionDBEdit = useRef("");
  const capacityDBEdit = useRef("");
  const instantBookDBEdit = useRef(false);
  const isChildVenueDBEdit = useRef(false);
  const visibleDBEdit = useRef(true);

  const parentVenueEdit = useRef(null);
  const startTimeDBEdit = useRef(null);
  const endTimeDBEdit = useRef(null);
  const [startTimeEdit, setStartTimeEdit] = useState("");
  const [endTimeEdit, setEndTimeEdit] = useState("");

  const [venueDropdown, setVenueDropdown] = useState([]);
  const [venueIDEdit, setVenueIDEdit] = useState("");
  const venueIDDBEdit = useRef("");
  const venueData = useRef([]);

  const [errorEdit, setErrorEdit] = useState(null);

  // Creating new venue;
  var handleDetails = useCallback((content) => {
    setModalData(content);
  }, []);

  var reset = useCallback(async () => {
    selectedFileDB.current = null;
    nameDB.current = "";
    descriptionDB.current = "";
    capacityDB.current = "";
    instantBookDB.current = false;
    isChildVenueDB.current = false;
    visibleDB.current = false;
    parentVenue.current = null;
    startTimeDB.current = null;
    endTimeDB.current = null;

    setName("");
    setDescription("");
    setCapacity("");
    setInstantBook(false);
    setIsChildVenue(false);
    setVisible(true);
    setFileName(null);
    setStartTime("");
    setEndTime("");
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      setError(null);
      event.preventDefault();
      const openingHours = startTimeDB.current + " - " + endTimeDB.current;
      if (
        validateFields(
          nameDB.current,
          descriptionDB.current,
          capacityDB.current,
          isChildVenueDB.current,
          parentVenue.current,
          startTimeDB.current,
          endTimeDB.current,
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
            body: data,
          });
          const content = await rawResponse.json();
          if (content.status) {
            await reset();
            toast({
              title: "Success",
              description: content.msg,
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
    [fetchData, reset, toast]
  );

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    selectedFileDB.current = file;
    setFileName(file.name);
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
      startTimeDB.current = value;
      setStartTime(value);
    }
  };

  const onEndTimeChange = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      endTimeDB.current = value;
      setEndTime(value);
    }
  };

  var includeActionButton = useCallback(
    async (content) => {
      const selection = [];
      const selectionEdit = [];
      let count = 0;
      venueData.current = [];

      selectionEdit.push(<option key={""} value={""}></option>);

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

          selectionEdit.push(
            <option key={data.id} value={data.id}>
              {data.name}
            </option>
          );

          venueData.current.push(data);
          const buttons = await generateActionButton(data);
          data.action = buttons;
        }
      }

      setParentVenueDropdown(selection);
      setVenueDropdown(selectionEdit);
      setData(content);
    },
    [generateActionButton]
  );

  var generateActionButton = useCallback(
    async (content) => {
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
    },
    [handleDetails]
  );

  var fetchData = useCallback(async () => {
    setLoadingData(true);
    setData(null);
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
      }
      setLoadingData(false);
    } catch (error) {
      console.log(error);
    }
  }, [includeActionButton]);

  var generateTimeSlots = useCallback(async () => {
    const start = [];
    const end = [];

    start.push(<option key={"start"} value={""}></option>);
    end.push(<option key={"end"} value={""}></option>);

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
  }, []);

  useEffect(() => {
    async function generate() {
      await fetchData();
      await generateTimeSlots();
    }

    generate();
  }, [fetchData, generateTimeSlots]);

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
    isChildVenue,
    parentVenue,
    startTime,
    endTime,
    openingHours
  ) => {
    //super basic validation here
    if (!name) {
      setError("Name must not be empty!");
      return false;
    }

    if (!description) {
      setError("Description must not be empty!");
      return false;
    }

    if (!capacity) {
      setError("Capacity must not be empty!");
      return false;
    }

    if (isChildVenue && !parentVenue) {
      setError("Please select a parent venue!");
      return false;
    }

    if (!openingHours) {
      setError("Please select the opening hours!");
      return false;
    }

    if (!startTime) {
      setError("Please select a start time!");
      return false;
    }

    if (!endTime) {
      setError("Please select an end time!");
      return false;
    }

    if (Number(startTime) >= Number(endTime)) {
      setError("Start time must be earlier than end time!");
      return false;
    }

    return true;
  };

  //Edit functions
  const onParentVenueChangeEdit = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      parentVenueEdit.current = value;
    }
  };

  const onStartTimeChangeEdit = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      startTimeDBEdit.current = value;
      setStartTimeEdit(value);
    }
  };

  const onEndTimeChangeEdit = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      endTimeDBEdit.current = value;
      setEndTimeEdit(value);
    }
  };

  const onVenueIDChangeEdit = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      venueIDDBEdit.current = value;
      setVenueIDEdit(value);

      if (venueData.current) {
        for (let key in venueData.current) {
          const data = venueData.current[key];
          if (data.id == value) {
            changeDataEdit(data);
          }
        }
      }
    }
  };

  const changeDataEdit = (data) => {
    setNameEdit(data.name);
    setDescriptionEdit(data.description);
    setCapacityEdit(data.capacity);
    setInstantBookEdit(data.isInstantBook);
    setIsChildVenueEdit(data.isChildVenue);
    setVisibleEdit(data.visible);

    nameDBEdit.current = data.name;
    descriptionDBEdit.current = data.description;
    capacityDBEdit.current = data.capacity;
    instantBookDBEdit.current = data.isInstantBook;
    isChildVenueDBEdit.current = data.isChildVenue;
    visibleDBEdit.current = data.visible;
    parentVenueEdit.current = data.parentVenue ? data.parentVenue : "";

    const split = data.openingHours.split("-");
    const start = split[0].trim();
    const end = split[1].trim();

    startTimeDBEdit.current = start;
    endTimeDBEdit.current = end;
    setStartTimeEdit(start);
    setEndTimeEdit(end);
  };

  var handleSubmitEdit = useCallback(
    async (event) => {
      setErrorEdit(null);
      event.preventDefault();

      const openingHours =
        startTimeDBEdit.current + " - " + endTimeDBEdit.current;
      if (
        validateFieldsEdit(
          venueIDDBEdit.current,
          nameDBEdit.current,
          descriptionDBEdit.current,
          capacityDBEdit.current,
          isChildVenueDBEdit.current,
          parentVenueEdit.current,
          startTimeDBEdit.current,
          endTimeDBEdit.current,
          openingHours
        )
      ) {
        const data = new FormData();
        data.append("id", venueIDDBEdit.current);
        data.append("name", nameDBEdit.current);
        data.append("description", descriptionDBEdit.current);
        data.append("capacity", capacityDBEdit.current);
        data.append("isInstantBook", instantBookDBEdit.current);
        data.append("visible", visibleDBEdit.current);
        data.append("isChildVenue", isChildVenueDBEdit.current);
        data.append("parentVenue", parentVenueEdit.current);
        data.append("openingHours", openingHours);

        try {
          const rawResponse = await fetch("/api/venue/edit", {
            method: "POST",
            body: data,
          });
          const content = await rawResponse.json();
          if (content.status) {
            await resetEdit();
            toast({
              title: "Success",
              description: content.msg,
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
    [fetchData, resetEdit, toast]
  );

  const validateFieldsEdit = (
    id,
    name,
    description,
    capacity,
    isChildVenue,
    parentVenue,
    startTime,
    endTime,
    openingHours
  ) => {
    //super basic validation here
    if (!id) {
      setErrorEdit("ID must not be empty!");
      return false;
    }

    if (!name) {
      setErrorEdit("Name must not be empty!");
      return false;
    }

    if (!description) {
      setErrorEdit("Description must not be empty!");
      return false;
    }

    if (!capacity) {
      setErrorEdit("Capacity must not be empty!");
      return false;
    }

    if (isChildVenue && !parentVenue) {
      setErrorEdit("Please select a parent venue!");
      return false;
    }

    if (!openingHours) {
      setErrorEdit("Please select the opening hours!");
      return false;
    }

    if (!startTime) {
      setErrorEdit("Please select a start time!");
      return false;
    }

    if (!endTime) {
      setErrorEdit("Please select an end time!");
      return false;
    }

    if (Number(startTime) >= Number(endTime)) {
      setErrorEdit("Start time must be earlier than end time!");
      return false;
    }

    return true;
  };

  var resetEdit = useCallback(async () => {
    nameDBEdit.current = "";
    descriptionDBEdit.current = "";
    capacityDBEdit.current = "";
    instantBookDBEdit.current = false;
    isChildVenueDBEdit.current = false;
    visibleDBEdit.current = false;
    parentVenueEdit.current = null;
    startTimeDBEdit.current = null;
    endTimeDBEdit.current = null;

    setNameEdit("");
    setDescriptionEdit("");
    setCapacityEdit("");
    setInstantBookEdit(false);
    setIsChildVenueEdit(false);
    setVisibleEdit(true);
    setStartTimeEdit("");
    setEndTimeEdit("");
  }, []);

  return (
    <Auth admin>
      <Box bg="white" borderRadius="lg" p={8} color="gray.700" shadow="base">
        <MotionBox variants={cardVariant} key="1">
          {loadingData && !data ? (
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

      <MotionSimpleGrid
        mt="3"
        minChildWidth={{ base: "full", md: "500px", lg: "500px" }}
        minH="full"
        variants={parentVariant}
        initial="initial"
        animate="animate"
      >
        <MotionBox>
          {" "}
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg="white"
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
                    value={name}
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
                    value={description}
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
                    value={capacity}
                    size="lg"
                    onChange={(event) => {
                      setCapacity(event.currentTarget.value);
                      capacityDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>
                {startTimeDropdown && (
                  <Stack w="full">
                    <FormLabel>Start Time</FormLabel>
                    <Select
                      value={startTime}
                      onChange={onStartTimeChange}
                      size="sm"
                    >
                      {endTimeDropdown}
                    </Select>
                  </Stack>
                )}

                {endTimeDropdown && (
                  <Stack w="full">
                    <FormLabel>End Time</FormLabel>
                    <Select
                      value={endTime}
                      onChange={onEndTimeChange}
                      size="sm"
                    >
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
                  <FormLabel fontSize="sm" fontWeight="md" color="gray.700">
                    Venue Photo
                  </FormLabel>
                  {fileName && <Text>File uploaded: {fileName}</Text>}
                  <Flex
                    mt={1}
                    justify="center"
                    px={6}
                    pt={5}
                    pb={6}
                    borderWidth={2}
                    borderColor="gray.300"
                    borderStyle="dashed"
                    rounded="md"
                  >
                    <Stack spacing={1} textAlign="center">
                      <Icon
                        mx="auto"
                        boxSize={12}
                        color="gray.400"
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
                        color="gray.600"
                        alignItems="baseline"
                      >
                        <chakra.label
                          htmlFor="file-upload"
                          cursor="pointer"
                          rounded="md"
                          fontSize="md"
                          color="brand.600"
                          pos="relative"
                          _hover={{
                            color: "brand.400",
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
                      <Text fontSize="xs" color="gray.500">
                        PNG, JPG, GIF up to 10MB
                      </Text>
                    </Stack>
                  </Flex>
                </FormControl>

                {error && (
                  <Stack align={"center"}>
                    <Text>{error}</Text>
                  </Stack>
                )}

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
        </MotionBox>

        <MotionBox>
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg="white"
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            my={12}
          >
            <Heading size="md">Edit existing venue</Heading>
            <form onSubmit={handleSubmitEdit}>
              <Stack spacing={4}>
                {venueDropdown && (
                  <Stack spacing={3} w="full">
                    <FormLabel>Select Venue</FormLabel>
                    <Select
                      value={venueIDEdit}
                      onChange={onVenueIDChangeEdit}
                      size="sm"
                    >
                      {venueDropdown}
                    </Select>
                  </Stack>
                )}

                <FormControl id="name">
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={nameEdit}
                    size="lg"
                    onChange={(event) => {
                      setNameEdit(event.currentTarget.value);
                      nameDBEdit.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>
                <FormControl id="description">
                  <FormLabel>Description</FormLabel>
                  <Input
                    type="text"
                    placeholder="Description"
                    value={descriptionEdit}
                    size="lg"
                    onChange={(event) => {
                      setDescriptionEdit(event.currentTarget.value);
                      descriptionDBEdit.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>
                <FormControl id="capacity">
                  <FormLabel>Capacity</FormLabel>
                  <Input
                    type="number"
                    placeholder="Capacity"
                    value={capacityEdit}
                    size="lg"
                    onChange={(event) => {
                      setCapacityEdit(event.currentTarget.value);
                      capacityDBEdit.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>
                {startTimeDropdown && (
                  <Stack w="full">
                    <FormLabel>Start Time</FormLabel>
                    <Select
                      value={startTimeEdit}
                      onChange={onStartTimeChangeEdit}
                      size="sm"
                    >
                      {endTimeDropdown}
                    </Select>
                  </Stack>
                )}

                {endTimeDropdown && (
                  <Stack w="full">
                    <FormLabel>End Time</FormLabel>
                    <Select
                      value={endTimeEdit}
                      onChange={onEndTimeChangeEdit}
                      size="sm"
                    >
                      {endTimeDropdown}
                    </Select>
                  </Stack>
                )}

                <Stack spacing={5} direction="row">
                  <Checkbox
                    isChecked={visibleEdit}
                    onChange={(event) => {
                      setVisibleEdit(event.target.checked);
                      visibleDBEdit.current = event.target.checked;
                    }}
                  >
                    Visible
                  </Checkbox>
                  <Checkbox
                    isChecked={instantBookEdit}
                    onChange={(event) => {
                      setInstantBookEdit(event.target.checked);
                      instantBookDBEdit.current = event.target.checked;
                    }}
                  >
                    Instant Book
                  </Checkbox>
                  <Checkbox
                    isChecked={isChildVenueEdit}
                    onChange={(event) => {
                      setIsChildVenueEdit(event.target.checked);
                      isChildVenueDBEdit.current = event.target.checked;
                    }}
                  >
                    Child Venue
                  </Checkbox>
                </Stack>
                {isChildVenueEdit && (
                  <Stack spacing={5} w="full">
                    <Text>Select Venue</Text>
                    <Select onChange={onParentVenueChangeEdit} size="sm">
                      {parentVenueDropdown}
                    </Select>
                  </Stack>
                )}

                {errorEdit && (
                  <Stack align={"center"}>
                    <Text>{errorEdit}</Text>
                  </Stack>
                )}

                <Stack spacing={10}>
                  <Button
                    type="submit"
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                  >
                    Update
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </MotionBox>
      </MotionSimpleGrid>
    </Auth>
  );
}
