import React from 'react'
import type { ComponentType, ReactNode } from 'react'

interface DynamicWrapperProps {
  providers: Array<ComponentType<{ children: ReactNode }>>;
  children: ReactNode;
}

const DynamicWrapper = ({ providers, children }: DynamicWrapperProps) => {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, children);
};

export default DynamicWrapper