import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storageService, UploadImageParams } from "@/services/storageService";
import { useToast } from "@/hooks/use-toast";

export function useGalleryImages(category?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images', category],
    queryFn: () => storageService.listImages(category),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: () => storageService.getCategories(),
  });

  const uploadMutation = useMutation({
    mutationFn: (params: UploadImageParams) => storageService.uploadImage(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storageService.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast({
        title: "Image deleted",
        description: "Image has been removed from gallery",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      storageService.updateImageMetadata(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast({
        title: "Metadata updated",
        description: "Image information has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    images,
    categories,
    isLoading,
    uploadImage: uploadMutation.mutate,
    deleteImage: deleteMutation.mutate,
    updateImage: updateMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
