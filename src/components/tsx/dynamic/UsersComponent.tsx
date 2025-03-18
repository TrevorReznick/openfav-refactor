import { useQuery } from '@tanstack/react-query';

async function fetchUsers() {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];
}

export default function UsersComponent() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users List</h2>
      <div className="space-y-2">
        {users?.map(user => (
          <div key={user.id} className="p-3 bg-card rounded-lg shadow">
            {user.name}
          </div>
        ))}
      </div>
    </div>
  );
}