
import { Link as LinkIcon } from 'lucide-react';
import { links, loading } from '@/store/linkStore';
import { useStore } from '@nanostores/react';

const LinksSection = () => {
  const $links = useStore(links);
  const $loading = useStore(loading);

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Links</h2>
      {$loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary-light/20 rounded" />
          ))}
        </div>
      ) : $links.length > 0 ? (
        <div className="space-y-4">
          {$links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary-light/20 transition-colors"
            >
              <LinkIcon className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">{link.title}</h3>
                {link.description && (
                  <p className="text-sm text-white/70 mt-1">{link.description}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-white/70">No links added yet</p>
      )}
    </div>
  );
};

export default LinksSection;
