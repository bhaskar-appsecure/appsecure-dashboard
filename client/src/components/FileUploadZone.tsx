import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  File,
  Image,
  FileText,
  Video,
  Archive,
  X,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileWithMetadata {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  url?: string;
  caption?: string;
}

interface FileUploadZoneProps {
  onFilesAdded?: (files: FileWithMetadata[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('text/')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return Archive;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUploadZone({
  onFilesAdded,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = [
    'image/*',
    'video/mp4',
    'application/pdf',
    'text/*',
    'application/json',
    'text/csv',
    'application/zip',
  ],
  className,
  disabled,
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;

      const newFiles: FileWithMetadata[] = acceptedFiles
        .slice(0, maxFiles - files.length)
        .map((file) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: 'uploading' as const,
        }));

      setFiles((prev) => [...prev, ...newFiles]);
      
      // Simulate upload progress
      newFiles.forEach((fileMetadata) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileMetadata.id
                  ? { ...f, progress: 100, status: 'complete' }
                  : f
              )
            );
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileMetadata.id ? { ...f, progress } : f
              )
            );
          }
        }, 200);
      });

      onFilesAdded?.(newFiles);
    },
    [files.length, maxFiles, onFilesAdded, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    disabled,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, caption } : f))
    );
  };

  return (
    <div className={cn('space-y-4', className)} data-testid="file-upload-zone">
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} data-testid="file-input" />
        <CardContent className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop files here' : 'Upload evidence files'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <div className="flex justify-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant="outline">Images</Badge>
            <Badge variant="outline">Videos</Badge>
            <Badge variant="outline">PDFs</Badge>
            <Badge variant="outline">Text Files</Badge>
            <Badge variant="outline">Archives</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Max {maxFiles} files, {formatFileSize(maxSize)} each
          </p>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
          {files.map((fileMetadata) => {
            const IconComponent = getFileIcon(fileMetadata.file.type);
            return (
              <Card key={fileMetadata.id} className="p-3">
                <div className="flex items-start gap-3">
                  <IconComponent className="h-8 w-8 text-muted-foreground shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-medium truncate">
                        {fileMetadata.file.name}
                      </h5>
                      <div className="flex items-center gap-2 shrink-0">
                        {fileMetadata.status === 'complete' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileMetadata.id)}
                          data-testid={`button-remove-${fileMetadata.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(fileMetadata.file.size)} • {fileMetadata.file.type}
                    </p>
                    {fileMetadata.status === 'uploading' && (
                      <Progress value={fileMetadata.progress} className="mt-2" />
                    )}
                    {fileMetadata.status === 'complete' && (
                      <input
                        type="text"
                        placeholder="Add a caption for this file..."
                        value={fileMetadata.caption || ''}
                        onChange={(e) => updateCaption(fileMetadata.id, e.target.value)}
                        className="mt-2 w-full px-3 py-1 text-sm bg-background border border-input rounded-md"
                        data-testid={`input-caption-${fileMetadata.id}`}
                      />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}