
import { Plus, Folder, Search } from 'lucide-react';

interface QuickActionsProps {
  onAddLink: () => void;
  onAddCollection: () => void;
}

const QuickActions = ({ onAddLink, onAddCollection }: QuickActionsProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <button 
        className="btn-primary flex items-center gap-2"
        onClick={onAddLink}
      >
        <Plus className="w-4 h-4" />
        Add Link
      </button>
      <button 
        className="btn-secondary flex items-center gap-2"
        onClick={onAddCollection}
      >
        <Folder className="w-4 h-4" />
        New Collection
      </button>
      <div className="flex-grow">
        <div className="relative max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="search"
            placeholder="Search links and collections..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-white/10 focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
