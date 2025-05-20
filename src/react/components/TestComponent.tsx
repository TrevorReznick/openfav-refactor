import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/react/components/ui/button';
import { ThemeToggle } from '@/react/components/ThemeToggle';
import { toast } from 'sonner';
import { counterStore, notifications, messageStore } from '@/store';
import { useStore } from '@nanostores/react';

type Message = string;

type Post = {
  id: number;
  title: string;
  description: string;
}

const TestComponent = () => {
  const count = useStore(counterStore);
  const messages = useStore(notifications) as string[];
  const message = useStore(messageStore);

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
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
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

  const incrementCount = () => {
    counterStore.set(count + 1);
    notifications.set([...messages, 'Count incremented']);
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
          onClick={incrementCount}
          className="w-full justify-center"
        >
          Count: {count}
        </Button>
        
        {messages.length > 0 && (
          <div className="mt-4 p-4 bg-card rounded-lg">
            <h3 className="font-semibold mb-2">Notifications:</h3>
            <div className="space-y-2">
              {messages.map((msg: Message, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold">API Data:</h3>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {posts?.data?.map((post: Post) => (
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
