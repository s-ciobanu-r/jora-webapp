import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Keyboard } from 'lucide-react';

interface Props {
  onAction: (params: any) => void;
  isLoading: boolean;
}

export function InputModeStep({ onAction, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>How would you like to enter data?</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-32 flex flex-col gap-2 hover:bg-primary/5 border-2"
          onClick={() => onAction({ choice: 'ocr', message: 'OCR Mode' })}
          disabled={isLoading}
        >
          <FileText className="h-8 w-8 text-primary" />
          <span className="font-semibold">{t('contract.processOCR')}</span>
          <span className="text-xs text-muted-foreground text-center px-2">
            Upload a photo of vehicle documents to auto-fill data
          </span>
        </Button>

        <Button 
          variant="outline" 
          className="h-32 flex flex-col gap-2 hover:bg-primary/5 border-2"
          onClick={() => onAction({ choice: 'manual', message: 'Manual Mode' })}
          disabled={isLoading}
        >
          <Keyboard className="h-8 w-8 text-primary" />
          <span className="font-semibold">{t('contract.manualEntry')}</span>
          <span className="text-xs text-muted-foreground text-center px-2">
            Type all information manually step by step
          </span>
        </Button>
      </CardContent>
    </div>
  );
}
