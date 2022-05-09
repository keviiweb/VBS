import Image from "next/image";
import { Box, Flex } from "@chakra-ui/react";

export default function Card({ product }) {
  const { img, title } = product;

  return (
    <Flex
      w="full"
      h="full"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      bg="white"
      rounded="xl"
      shadow="lg"
      borderWidth="1px"
    >
      <Box w="full" h="full">
        <Box
          w="100%"
          height="200px"
          position="relative"
          overflow="hidden"
          roundedTop="lg"
        >
        {img && (  
        <Image
            src={img}
            objectFit="cover"
            alt="picture"
            layout="fill"
          />
        )}
        
        </Box>

        <Box p="6">
            {title && ( 
            <Box fontWeight="semibold" as="h3" lineHeight="tight" isTruncated> 
            {title}
            </Box> 
            )}            
        </Box>
      </Box>
    </Flex>
  );
}
