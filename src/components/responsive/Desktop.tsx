import {useMediaQuery} from "react-responsive";

export const Desktop = ({children}: { children: React.ReactNode }) => {
  const isDesktop = useMediaQuery({maxWidth: 769})
  return isDesktop ? isDesktop : null
}