import { useState } from 'react';
import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  onAction: (params: any) => void;
  isLoading: boolean;
}

export function PriceStep({ onAction, isLoading }: Props) {
  const { t } = useTranslation();
  const [price, setPrice] = useState('');

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>{t('contract.price')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="0.00"
          />
          <span className="font-bold">EUR</span>
        </div>
        <Button className="w-full" onClick={() => onAction({ message: price })} disabled={isLoading || !price}>
          {t('common.confirm')}
        </Button>
      </CardContent>
    </div>
  );
}
