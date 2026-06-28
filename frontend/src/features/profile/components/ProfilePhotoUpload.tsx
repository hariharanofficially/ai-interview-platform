import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { profileApi } from '../api/profileApi';
import { getInitials } from '@lib/utils';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  name: string;
}

export function ProfilePhotoUpload({ currentPhotoUrl, name }: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get presigned URL
      const { data: urlRes } = await profileApi.getUploadUrl(file.type);
      const { url, key } = urlRes.data!;

      // 2. Upload to S3/MinIO directly
      const uploadRes = await profileApi.uploadToS3(url, file);
      if (!uploadRes.ok) throw new Error('Upload failed to S3');

      // 3. Confirm with backend
      await profileApi.confirmUpload(key);

      toast.success('Profile photo updated successfully');
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Update global auth store if possible or wait for query refresh
      // Since we don't return the full URL from confirm, we'll let the profile fetch update it
    } catch (error: any) {
      toast.error('Failed to upload photo');
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center text-3xl font-bold text-primary-400 shrink-0 relative">
          {currentPhotoUrl ? (
            <img src={currentPhotoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            getInitials(name)
          )}
          
          {/* Hover Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              <>
                <Camera className="text-white mb-1" size={24} />
                <span className="text-[10px] text-white uppercase font-bold tracking-wider">Change</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg, image/png, image/webp" 
        className="hidden" 
      />
      
      <div className="text-center">
        <p className="text-xs text-slate-500">
          Recommended: Square image, max 5MB.<br/>
          JPEG, PNG, or WEBP.
        </p>
      </div>
    </div>
  );
}
