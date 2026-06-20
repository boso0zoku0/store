import {useMediaQuery} from 'react-responsive';

export const Mobile = ({children}: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery({maxWidth: 768})
  return isMobile ? isMobile : null
}