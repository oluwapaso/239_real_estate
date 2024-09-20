import { useMediaQuery } from '@react-hook/media-query';

const breakpoints = {
  xs: '480px',
  sm: '768px',
  md: '992px',
  lg: '1200px',
  xl: '1600px',
};

const useCurrentBreakpoint = () => {
  
    const is1Xm = useMediaQuery('(max-width: 420px)');
    const is2Xm = useMediaQuery('(min-width: 420px) and (max-width: 540px)');
    const isXs = useMediaQuery('(min-width: 540px) and (max-width: 640px)');
    const isSm = useMediaQuery('(min-width: 640px) and (max-width: 768px)');
    const isMd = useMediaQuery('(min-width: 768px) and (max-width: 960px)');
    const isTab = useMediaQuery('(min-width: 960px) and (max-width: 1024px)');
    const isLg = useMediaQuery('(min-width: 1024px) and (max-width: 1280px)');
    const isXl = useMediaQuery('(min-width: 1280px) and (max-width: 1536px)');
    const is2Xl = useMediaQuery('(min-width: 1536px)');
    

  return { is2Xm, is1Xm, isXs, isSm, isMd, isTab, isLg, isXl, is2Xl };
};

export default useCurrentBreakpoint;
