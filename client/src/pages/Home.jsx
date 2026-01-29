import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import VideoSection from '../components/VideoSection';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <About />
      <VideoSection />
      <Services />
      <Testimonials />
    </>
  );
};

export default Home;