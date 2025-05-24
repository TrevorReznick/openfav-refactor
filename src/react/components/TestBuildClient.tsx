import type { FC } from 'react';
import AppClient from '@/react/AppClient';

interface TestBuildClientProps {
  componentName: string;
}

export const TestBuildClient: FC<TestBuildClientProps> = ({ componentName }) => (
  <AppClient componentName={componentName}>
    <div className="p-4 text-center text-muted-foreground">
      No component selected or component failed to load.
    </div>
  </AppClient>
);
