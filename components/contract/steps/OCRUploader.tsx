import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, SkipForward, Loader2 } from 'lucide-react';

interface Props {
  onAction: (params: any) => void;
  isLoading: boolean;
  stage: string;
}

export function OCRUploader({ onAction, isLoading, stage }: Props) {
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // In a real app, you would upload to S3/Cloudinary here
    // For this demo/n8n setup, we might assume base64 or a direct URL 
    // Since we don't have a backend upload endpoint in the snippets yet,
    // we'll simulate it or prompt the user.
    
    // NOTE: This usually requires an actual file upload endpoint.
    // For now, we will just send a mock URL or alert.
    console.log("File dropped:", acceptedFiles[0]);
    alert("File upload integration required. Sending mock URL.");
    onAction({ file_url: "https://example.com/mock-doc.jpg" });
  }, [onAction]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const isProcessing = stage !== 'ocr_wait_file_url';

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>{t('contract.uploadDocument')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">{t('contract.processOCR')}...</p>
            <p className="text-sm text-muted-foreground text-center">
              Extracting data from your document. This may take a few seconds.
            </p>
          </div>
        ) : (
          <>
            <div 
              {...getRootProps()} 
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium text-lg">
                  {isDragActive ? "Drop file here" : "Drag & drop file here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files (JPG, PNG, PDF)
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                onClick={() => onAction({ action: 'skip_ocr', message: 'Skip' })}
                disabled={isLoading}
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip OCR and enter manually
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </div>
  );
}
