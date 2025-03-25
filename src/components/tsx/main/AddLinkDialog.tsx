
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { 
  addLink, 
  fetchClassificationTypes, 
  contextTypes, 
  resourceTypes, 
  functionTypes 
} from "@/store/linkStore";
import { useStore } from '@nanostores/react';

interface AddLinkDialogProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddLinkDialog = ({ open, onOpenChange, onSuccess }: AddLinkDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    context_id: '',
    resource_id: '',
    function_id: ''
  });

  // Usa nanostore
  const $contextTypes = useStore(contextTypes);
  const $resourceTypes = useStore(resourceTypes);
  const $functionTypes = useStore(functionTypes);

  useEffect(() => {
    if (open) {
      fetchClassificationTypes();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addLink(formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Link added successfully');
      onSuccess();
      onOpenChange(false);
      setFormData({ 
        title: '', 
        url: '', 
        description: '',
        context_id: '',
        resource_id: '',
        function_id: ''
      });
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
          <DialogTitle>Add New Link</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 rounded-lg bg-secondary-light border border-white/10 focus:border-primary focus:outline-none"
              placeholder="Enter link title"
            />
          </div>
          
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-1">
              URL
            </label>
            <input
              id="url"
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full p-2 rounded-lg bg-secondary-light border border-white/10 focus:border-primary focus:outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="context_id" className="block text-sm font-medium mb-1">
              Environment
            </label>
            <select
              id="context_id"
              value={formData.context_id}
              onChange={(e) => setFormData(prev => ({ ...prev, context_id: e.target.value }))}
              className="w-full p-2 rounded-lg bg-secondary-light border border-white/10 focus:border-primary focus:outline-none"
            >
              <option value="">Select environment</option>
              {$contextTypes.map((context) => (
                <option key={context.context_id} value={context.context_id}>
                  {context.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="resource_id" className="block text-sm font-medium mb-1">
              Resource Type
            </label>
            <select
              id="resource_id"
              value={formData.resource_id}
              onChange={(e) => setFormData(prev => ({ ...prev, resource_id: e.target.value }))}
              className="w-full p-2 rounded-lg bg-secondary-light border border-white/10 focus:border-primary focus:outline-none"
            >
              <option value="">Select resource type</option>
              {$resourceTypes.map((type) => (
                <option key={type.resource_id} value={type.resource_id}>
                  {type.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="function_id" className="block text-sm font-medium mb-1">
              Function Type
            </label>
            <select
              id="function_id"
              value={formData.function_id}
              onChange={(e) => setFormData(prev => ({ ...prev, function_id: e.target.value }))}
              className="w-full p-2 rounded-lg bg-secondary-light border border-white/10 focus:border-primary focus:outline-none"
            >
              <option value="">Select function type</option>
              {$functionTypes.map((type) => (
                <option key={type.function_id} value={type.function_id}>
                  {type.description}
                </option>
              ))}
            </select>
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
              placeholder="Enter link description"
              rows={3}
            />
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
              {loading ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkDialog;
