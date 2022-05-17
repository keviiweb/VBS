import {
  Avatar,
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { currentSession } from "@constants/helper";

export default function UserProfile(props) {
  const [admin, setAdmin] = useState(null);
  const [name, setName] = useState(null);
  const [url, setURL] = useState("https://vbs-kevii.vercel.app"); //default
  const router = useRouter();

  useEffect(() => {
    async function fetchData(props) {
      const session = await currentSession();
      let admin = session && session.user.admin ? "Admin" : "User";
      let name =
        session && session.user.username ? session.user.username : "Test User";
      setAdmin(admin);
      setName(name);
      
      const propRes = await props;
      try {
        if (propRes.data) {
          setURL(propRes.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <HStack spacing={{ base: "0", md: "6" }}>
      <Flex alignItems="center">
        <Menu>
          <MenuButton
            py={2}
            transition="all 0.3s"
            _focus={{ boxShadow: "none" }}
          >
            <HStack spacing="4">
              <Avatar
                size="md"
                src={
                  "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                }
              />
              <VStack
                display={{ base: "none", md: "flex" }}
                alignItems="flex-start"
                spacing="1px"
                ml="2"
              >
                <Text fontSize="md">{name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {admin}
                </Text>
              </VStack>
              <Box display={{ base: "none", md: "flex" }}>
                <FiChevronDown />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList fontSize="lg" bg="white" borderColor="gray.200">
            <MenuItem onClick={() => router.push("/profile")}>Profile</MenuItem>
            <MenuDivider />
            <MenuItem onClick={() => signOut({ callbackUrl: url + "/signin" })}>
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </HStack>
  );
}

export async function getServerSideProps(_context) {
  return {
    props: (async function () {
      try {
        return {
          data: process.env.NEXTAUTH_URL,
        };
      } catch (error) {
        console.error(error);
        return {
          data: null,
        };
      }
    })(),
  };
}
