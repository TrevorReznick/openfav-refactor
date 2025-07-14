import type { ReactNode } from 'react';
import { cn } from '~/lib/utils/utils';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
};

export const PageContainer = ({
  children,
  className,
  title,
  description,
}: PageContainerProps) => {
  return (
    <div className={cn("flex flex-col min-h-screen w-full items-center justify-center", className)}>
      <main className="w-full my-auto py-8">
        <div className="container flex items-center justify-center min-h-[50vh]">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
