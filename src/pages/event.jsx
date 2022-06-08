import React from 'react';
import Landing from '@layout/landing';
import Card from '@components/landing/Card';
import { SimpleGrid, Box } from '@chakra-ui/react';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);

export default function Event() {
  const content = [
    {
      img: '/landing/event/ihg.png',
      title: 'Inter-Hall Games (IHG)',
      description:
        'Our athletes train hard over the year to prepare themselves for Inter-Hall Games (IHG), striving to bring glory to KEVII. They train hard and play hard together, forging camaraderie and long-lasting friendships in the process.',
      link: '/',
    },
    {
      img: '/landing/event/enota.png',
      title: 'E-NOTA (Night of The Arts)',
      description:
        'Held annually, NOTA provides a platform for our cultural CCAs to showcase their craft. These include Acapella, Dance, Ensemble and even Cheerleading performances! The award-winning showcase was shifted online the past two years to ensure that our performers and audience can enjoy the showcase safely!',
      link: '/',
    },
    {
      img: '/landing/event/fop.png',
      title: 'Freshmen Orientation Programmes',
      description:
        "As part of NUSSU's Rag & Flag, KE Rag's annual vibrant performance attained the silver award in 2021, while KE Flag strives to give back to the community by raising funds and engaging with our beneficiary. KEWOC (King Edward Welcoming Orientation Camp) and EC (Engagement Camp) assists the freshmen in their transition to hall life. Despite the conversion to an online format during the pandemic, it did not stop our KEVIIans and freshmen from immersing themselves and enjoying the experience!",
      link: '/',
    },
    {
      img: '/landing/event/hallevent.png',
      title: 'Hall Events',
      description:
        'Ranging from block cohesions to hall wide activities, KEVIIans have plenty of occasions to form bonds and meet new people. Block suppers, KEVIIans Day as well as Dinner and Dance are just some examples of events we participate in!',
      link: '/',
    },
  ];

  return (
    <Landing>
      <MotionSimpleGrid
        columns={{ base: 1, md: 1, lg: 1, xl: 2 }}
        pos='relative'
        gap={{ base: 6, sm: 8 }}
        px={{ sm: 2 , md: 2, lg: 5, xl: 8}}
        py={{ sm: 2 , md: 2, lg: 5, xl: 8}}
        p={{ sm: 2 , md: 2, lg: 5, xl: 8}}
        variants={parentVariant}
        initial='initial'
        animate='animate'
      >
        {content.map((slide, sid) => (
          <MotionBox key={sid} variants={cardVariant}>
            <Card
              key={sid}
              title={slide.title}
              description={slide.description}
              img={slide.img}
              link={slide.link}
            />
          </MotionBox>
        ))}
      </MotionSimpleGrid>
    </Landing>
  );
}
