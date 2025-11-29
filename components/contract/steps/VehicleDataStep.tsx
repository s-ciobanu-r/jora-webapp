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

export function VehicleDataStep({ stage, onAction, isLoading }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  // Map stage to label
  const getLabel = () => {
    switch (stage) {
      case 'vehicle_brand_model': return t('contract.brandModel');
      case 'vehicle_vin': return t('contract.vin');
      case 'vehicle_km': return t('contract.mileage');
      case 'vehicle_first_reg': return t('contract.firstRegistration');
      default: return t('contract.vehicleData');
    }
  };

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>{getLabel()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          placeholder={`Enter ${getLabel()}...`}
        />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => onAction({ message: value })} disabled={isLoading || !value}>
            {t('common.next')}
          </Button>
          {stage === 'vehicle_vin' && (
             <Button variant="ghost" onClick={() => onAction({ action: 'skip', message: 'Skip' })}>
               Skip
             </Button>
          )}
        </div>
      </CardContent>
    </div>
  );
}
