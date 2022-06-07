import Header from "@components/landing/Header";
import Hero from "@components/landing/Hero";
import Feature from "@components/landing/Features";
import Social from "@components/landing/Social";
import Video from "@components/landing/Video";
import Carousel from "@components/landing/Carousel";

export default function Layout() {
  return (
    <>
      <Header />
      <Hero />
      <Video />
      <Feature />
      <Carousel />
      <Social />
    </>
  );
}
