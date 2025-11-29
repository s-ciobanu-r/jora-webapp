import { useState } from 'react';
import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  stage: string;
  onAction: (params: any) => void;
  isLoading: boolean;
}

export function BuyerDataStep({ stage, onAction, isLoading }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  // Extract field name from stage (e.g., 'buyer_name' -> 'name')
  const fieldKey = stage.replace('buyer_', '');
  
  return (
    <div className="space-y-4">
      <CardHeader>
        {/* @ts-ignore - dynamic key access for simple translation lookup */}
        <CardTitle>{t(`buyers.${fieldKey}`) || 'Buyer Details'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          autoFocus
        />
        <Button className="w-full" onClick={() => onAction({ message: value })} disabled={isLoading || !value}>
          {t('common.next')}
        </Button>
      </CardContent>
    </div>
  );
}
