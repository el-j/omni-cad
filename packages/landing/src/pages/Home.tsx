 // eslint-disable-line no-unused-vars
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Engines } from '../components/Engines';

export const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <Engines />
    </>
  );
};
