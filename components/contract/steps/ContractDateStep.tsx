import { useState } from 'react';
import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface Props {
  onAction: (params: any) => void;
  isLoading: boolean;
  stage: string;
}

export function ContractDateStep({ onAction, isLoading, stage }: Props) {
  const { t } = useTranslation();
  // Default to today
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  if (stage === 'contract_date_confirm') {
    return (
      <div className="space-y-4">
        <CardHeader>
          <CardTitle>{t('common.confirm')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Is the date correct?</p>
          <div className="flex gap-2">
            <Button onClick={() => onAction({ action: 'confirm' })} disabled={isLoading}>
              {t('common.confirm')}
            </Button>
            <Button variant="outline" onClick={() => onAction({ action: 'retry' })} disabled={isLoading}>
              {t('common.edit')}
            </Button>
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>{t('contract.contractDate')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button 
          className="w-full"
          onClick={() => onAction({ message: date })}
          disabled={isLoading || !date}
        >
          {t('common.next')}
        </Button>
      </CardContent>
    </div>
  );
}
