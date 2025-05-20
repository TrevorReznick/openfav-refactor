import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/tsx/ui/button';
import { ThemeToggle } from '@/components/tsx/theme-toggle';
import { toast } from 'sonner';

const TestComponent = () => {
  const [count, setCount] = useState(0);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['test-data'],
    queryFn: async () => {
      const response = await fetch('/api/v1/main/doQueries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'getSites', limit: 3 }),
      });
      return response.json();
    },
  });

  const showToast = () => {
    toast.success('Success message! 🎉', {
      position: 'top-right',
      duration: 3000,
      description: 'This is a success notification with Sonner'
    });

    setTimeout(() => {
      toast.error('Error message! ⚠️', {
        position: 'bottom-right',
        duration: 3000,
        description: 'This is an error notification with Sonner'
      });
    }, 2000);

    setTimeout(() => {
      toast('Info message! ℹ️', {
        position: 'top-center',
        duration: 3000,
        description: 'This is an info notification with Sonner'
      });
    }, 4000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test Component</h2>
        <ThemeToggle />
      </div>

      <div className="space-y-4">
        <Button 
          onClick={showToast} 
          className="w-full justify-center"
        >
          Show Sonner Toasts
        </Button>
        <Button 
          onClick={() => setCount(c => c + 1)}
          className="w-full justify-center"
        >
          Count: {count}
        </Button>
        
        <div className="space-y-2">
          <h3 className="font-semibold">API Data:</h3>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {posts?.data?.map((post: any) => (
                <div key={post.id} className="p-2 bg-card rounded-lg">
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">{post.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
