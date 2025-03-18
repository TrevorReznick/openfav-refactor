import { useQuery } from '@tanstack/react-query';

async function fetchPosts() {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: 1, title: 'First Post', content: 'This is the first post content' },
    { id: 2, title: 'Second Post', content: 'This is the second post content' },
  ];
}

export default function PostsComponent() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Posts List</h2>
      <div className="space-y-4">
        {posts?.map(post => (
          <div key={post.id} className="p-4 bg-card rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-muted-foreground">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}