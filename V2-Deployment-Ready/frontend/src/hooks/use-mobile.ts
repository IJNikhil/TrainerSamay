import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    const mql = window.matchMedia(mediaQuery);

    const handleChange = () => {
      setIsMobile(mql.matches);
    };

    handleChange();
    mql.addEventListener("change", handleChange);

    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
