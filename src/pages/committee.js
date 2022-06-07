import Landing from "@layout/landing";
import Card from "@components/landing/Card";
import { SimpleGrid, Flex, Stack, Box, Text } from "@chakra-ui/react";

export default function Committee() {
  const content = [
    {
      img: "/landing/event/ihg.png",
      title: "Inter-Hall Games (IHG)",
      description:
        "Our athletes train hard over the year to prepare themselves for Inter-Hall Games (IHG), striving to bring glory to KEVII. They train hard and play hard together, forging camaraderie and long-lasting friendships in the process.",
    },
    {
      img: "/landing/event/enota.png",
      title: "E-NOTA (Night of The Arts)",
      description:
        "Held annually, NOTA provides a platform for our cultural CCAs to showcase their craft. These include Acapella, Dance, Ensemble and even Cheerleading performances! The award-winning showcase was shifted online the past two years to ensure that our performers and audience can enjoy the showcase safely!",
    },
    {
      img: "/landing/event/fop.png",
      title: "Freshmen Orientation Programmes",
      description:
        "As part of NUSSU's Rag &amp; Flag, KE Rag&rsquo;s annual vibrant performance attained the silver award in 2021, while KE Flag strives to give back to the community by raising funds and engaging with our beneficiary. KEWOC (King Edward Welcoming Orientation Camp) and EC (Engagement Camp) assists the freshmen in their transition to hall life. Despite the conversion to an online format during the pandemic, it did not stop our KEVIIans and freshmen from immersing themselves and enjoying the experience!",
    },
    {
      img: "/landing/event/hallevent.png",
      title: "Hall Events",
      description:
        "Ranging from block cohesions to hall wide activities, KEVIIans have plenty of occasions to form bonds and meet new people. Block suppers, KEVIIans Day as well as Dinner and Dance are just some examples of events we participate in!",
    },
  ];

  return (
    <Landing>
      <Flex
        w="full"
        bg="#F9FAFB"
        p={10}
        alignItems="center"
        justifyContent="center"
      >
        <Stack>
          <Box textAlign={"center"}>
            <Text
              mt={2}
              mb={10}
              fontSize={{ base: "2xl", sm: "3xl", lg: "4xl" }}
              lineHeight="8"
              fontWeight="extrabold"
              letterSpacing="tight"
              color="gray.900"
            >
              KING EDWARD VII COMMITTEE
            </Text>
          </Box>
        </Stack>
      </Flex>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 2 }}
        pos="relative"
        gap={{ base: 6, sm: 8 }}
        px={5}
        py={6}
        p={{ sm: 8 }}
      >
        {content.map((slide, sid) => (
          <Card
            key={sid}
            title={slide.title}
            description={slide.description}
            img={slide.img}
          />
        ))}
      </SimpleGrid>
    </Landing>
  );
}
