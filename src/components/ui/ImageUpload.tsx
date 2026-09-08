import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label, folder = 'misc', className = '' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setError('');
    setUploading(true);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    setUploading(false);

    if (uploadError) {
      setError('Failed to upload image');
      return;
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
    onChange(urlData.publicUrl);
  };

  const handleRemove = async () => {
    if (value) {
      const path = value.split('/images/')[1];
      if (path) {
        await supabase.storage.from('images').remove([path]);
      }
    }
    onChange('');
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Upload preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors bg-gray-50 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {value && !uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Change image
        </button>
      )}
    </div>
  );
}
