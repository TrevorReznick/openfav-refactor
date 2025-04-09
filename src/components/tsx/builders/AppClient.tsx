import React from 'react';
import DynamicWrapper from '@/components/tsx/builders/DynamicWrapper'
import { NavigationProvider } from '@/hooks/NavigationContextV1'
import { ThemeProvider } from '@/components/tsx/theme-provider'
import Navbar from '@/components/tsx/common/Navbar'



const providers = [ThemeProvider, NavigationProvider];

const AppClient = () => {
  return (
    <DynamicWrapper providers={providers}>
      <Navbar />
      {/* Altri componenti che necessitano dei contesti */}
    </DynamicWrapper>
  );
};

export default AppClient;