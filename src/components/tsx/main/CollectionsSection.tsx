
import { Folder } from 'lucide-react';
import { collections, loading } from '@/store/linkStore';
import { useStore } from '@nanostores/react';

const CollectionsSection = () => {
  const $collections = useStore(collections);
  const $loading = useStore(loading);

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-4">Your Collections</h2>
      {$loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary-light/20 rounded" />
          ))}
        </div>
      ) : $collections.length > 0 ? (
        <div className="space-y-4">
          {$collections.map((collection) => (
            <div
              key={collection.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary-light/20 transition-colors cursor-pointer"
            >
              <Folder className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-white/70 mt-1">{collection.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/70">No collections created yet</p>
      )}
    </div>
  );
};

export default CollectionsSection;
