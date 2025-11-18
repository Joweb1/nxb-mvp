import { Dimensions } from 'react-native';
import { useEffect, useState } from 'react';

const breakpoints = {
  tablet: 768,
};

export const useResponsive = () => {
  const [screen, setScreen] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreen(window);
    });

    return () => subscription.remove();
  }, []);

  const { width, height } = screen;
  const isTablet = width >= breakpoints.tablet;

  return { width, height, isTablet };
};
