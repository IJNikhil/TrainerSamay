// src/components/common/PageWrapper.tsx

import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  // This component simply renders its children.
  // Its purpose is to act as an explicit render boundary for React Router's `element` prop.
  return <>{children}</>;
};

export default PageWrapper;