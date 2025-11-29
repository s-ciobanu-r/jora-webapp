import { useState } from 'react';
import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  stage: string;
  payload: any;
  options: any[];
  onAction: (params: any) => void;
  isLoading: boolean;
}

export function ContractNumberStep({ stage, onAction, isLoading }: Props) {
  const { t } = useTranslation();
  const [manualNumber, setManualNumber] = useState('');

  const isConfirm = stage === 'contract_number_confirm';

  if (isConfirm) {
    return (
      <div className="space-y-4">
        <CardHeader>
          <CardTitle>Confirm Contract Number</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Is the selected contract number correct?
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => onAction({ action: 'confirm' })} disabled={isLoading}>
            {t('common.confirm')}
          </Button>
          <Button variant="outline" onClick={() => onAction({ action: 'retry' })} disabled={isLoading}>
            {t('common.retry')}
          </Button>
        </CardFooter>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>{t('contract.contractNumber')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full justify-start text-left h-auto py-4"
          variant="outline"
          onClick={() => onAction({ action: 'select_number', choice: 'auto', message: 'Auto' })}
          disabled={isLoading}
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold">Auto-generate Number</span>
            <span className="text-xs text-muted-foreground">Automatically assign the next available number</span>
          </div>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-number">{t('contract.contractNumber')}</Label>
          <div className="flex gap-2">
            <Input 
              id="manual-number"
              value={manualNumber}
              onChange={(e) => setManualNumber(e.target.value)}
              placeholder="e.g. 2024-001"
            />
            <Button 
              onClick={() => onAction({ action: 'select_number', message: manualNumber })}
              disabled={isLoading || !manualNumber}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
