import React from 'react';
import Landing from '@layout/landing';
import Card from '@components/landing/Card';
import { motion } from 'framer-motion';
import { SimpleGrid, Flex, Stack, Box, Text } from '@chakra-ui/react';
import { cardVariant, parentVariant } from '@root/motion';

const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);

/**
 * Shows the list of personnel around KE
 *
 * @returns Community Page
 */
export default function Community () {
  const content = [
    {
      img: '/landing/community/hall-master_beach-clean-up.png',
      title: 'HALL ADMIN',
      description: `A/PROF KULDIP SINGH (LEFT)
        Hall Master
        
        Our hall is administered by passionate members from the Senior Common Room Committee (SCRC), Residential Life and Office of Housing Services.
        
        The SCRC is led by the Hall Master and is assisted by both residential and non-residential fellows. They serve not only as advisors and mentors but also as guardians and friends to every KEVIIANS. They help to oversee all hall activities and ensure the well-being of each resident.
        
        Residents can also find our warm and friendly staff who are in charge of day-to-day operations at the Hall Office. They take care of administrative matters and ensure that all facilities are well-maintained. They are the ones who keep our hall running in tip-top condition!`,
      buttonText: 'Find out who they are',
      buttonLink: 'https://nus.edu.sg/osa/keviihall/about/hall-admin'
    },
    {
      img: '/landing/community/faceofke.png',
      title: 'FACES OF KE (FOKE)',
      description: `ONG WEI QIANG (RIGHT)
        Year 3, Psychology and Economics
        
        My past three years here in KE have truly been a blessing. It has provided me with a safe space and offered me countless opportunities to try new things and develop myself as a leader. I picked up table tennis again, and was given an opportunity to lead a team of self-driven athletes whom I am very proud of. Through my other CCAs and the daily interactions with other residents, I was able to have interesting encounters with international students from all over the world and local students from different faculties, and most importantly, form deep connections with like-minded people whom later become my close friends. 
        
        KE has such a family-like and wholesome environment that it really feels like my second home. I have always told my friends that I am very lucky to have the opportunity to stay on campus, but even luckier to have mine spent with the KE community.`,
      buttonText: 'Find out #WHYKE',
      buttonLink: 'https://www.instagram.com/kingedwardviihall'
    }
  ];

  return (
    <Landing>
      <Flex
        w='full'
        bg='#F9FAFB'
        p={10}
        alignItems='center'
        justifyContent='center'
      >
        <Stack>
          <Box textAlign='center'>
            <Text
              mt={2}
              mb={10}
              fontSize={{ base: '3xl', sm: '4xl', lg: '5xl' }}
              lineHeight='8'
              fontWeight='extrabold'
              letterSpacing='tight'
              color='gray.900'
            >
              THE KE COMMUNITY
            </Text>
            <Text
              mt={2}
              mb={10}
              fontSize={{ base: 'xl', sm: '2xl', lg: '3xl' }}
              lineHeight='8'
              letterSpacing='tight'
              color='gray.900'
            >
              Our Hall is made up of many individuals driven by passion.
            </Text>
          </Box>
        </Stack>
      </Flex>
      <MotionSimpleGrid
        columns={{ base: 1, md: 1, lg: 1, xl: 2 }}
        pos='relative'
        gap={{ base: 2, sm: 8 }}
        px={{ base: 1, sm: 2, md: 3, lg: 8, xl: 8 }}
        py={{ base: 2, sm: 2, md: 3, lg: 8, xl: 8 }}
        p={{ base: 2, sm: 2, md: 3, lg: 8, xl: 8 }}
        variants={parentVariant}
        initial='initial'
        animate='animate'
      >
        {content.map(
          (
            slide: {
              img: string,
              title: string,
              description: string,
              buttonText: string,
              buttonLink: string,
            },
            sid
          ) => (
            <MotionBox key={sid} variants={cardVariant}>
              <Card
                key={sid}
                title={slide.title}
                description={slide.description}
                img={slide.img}
                buttonText={slide.buttonText}
                buttonLink={slide.buttonLink}
                link={null}
              />
            </MotionBox>
          )
        )}
      </MotionSimpleGrid>
    </Landing>
  );
}
