
import { useState } from 'react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { addCollection } from "@/store/linkStore";

interface AddCollectionDialogProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddCollectionDialog = ({ open, onOpenChange, onSuccess }: AddCollectionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addCollection(formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Collection created successfully');
      onSuccess();
      onOpenChange(false);
      setFormData({ name: '', description: '', is_public: false });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-secondary sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 rounded-lg bg-secondary-light border border-white/10 focus:border-primary focus:outline-none"
              placeholder="Enter collection name"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 rounded-lg bg-secondary-light border border-white/10 focus:border-primary focus:outline-none"
              placeholder="Enter collection description"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_public"
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="rounded border-white/10 bg-secondary-light"
            />
            <label htmlFor="is_public" className="text-sm font-medium">
              Make this collection public
            </label>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <DialogClose asChild>
              <button
                type="button"
                className="btn-secondary"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCollectionDialog;
