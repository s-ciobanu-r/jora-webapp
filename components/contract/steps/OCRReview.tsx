import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props {
  stage: string;
  payload: any;
  onAction: (params: any) => void;
  isLoading: boolean;
}

export function OCRReview({ payload, onAction, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Review OCR Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>VIN</Label>
            <Input value={payload?.vin || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Input value={payload?.brand_model || ''} readOnly />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onAction({ action: 'reject' })} disabled={isLoading}>
            Reject
          </Button>
          <Button onClick={() => onAction({ action: 'confirm' })} disabled={isLoading}>
            Confirm Data
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
