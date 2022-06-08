import Landing from "@layout/landing";
import Hero from "@components/landing/Hero";
import Feature from "@components/landing/Features";
import Video from "@components/landing/Video";
import Carousel from "@components/landing/Carousel";

export default function Index() {
  return (
    <Landing>
      <Hero />
      <Video />
      <Feature />
      <Carousel />
    </Landing>
  );
}
