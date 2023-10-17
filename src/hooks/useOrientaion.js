import {useWindowDimensions} from 'react-native';

export const useOrientation = () => {
  const {height, width} = useWindowDimensions();
  const isLandscape = width > height;
  return {isLandscape};
};
