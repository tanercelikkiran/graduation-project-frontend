import { Dimensions } from "react-native";

const baseWidth = 375;
const baseHeight = 812;

export const useScale = () => {
  const window = Dimensions.get("window");

  const scaleX = window.width / baseWidth;
  const scaleY = window.height / baseHeight;

  const horizontalScale = (size: number) => Math.round(size * scaleX);
  const verticalScale = (size: number) => Math.round(size * scaleY);

  return {
    horizontalScale,
    verticalScale,
    scaleX,
    scaleY,
  };
};