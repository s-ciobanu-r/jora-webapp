import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  payload: any;
  onAction: (params: any) => void;
  isLoading: boolean;
}

export function SummaryReview({ payload, onAction, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>{t('contract.summary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
          <div className="flex justify-between"><span>Buyer:</span> <strong>{payload?.buyer_name}</strong></div>
          <div className="flex justify-between"><span>Vehicle:</span> <strong>{payload?.brand_model}</strong></div>
          <div className="flex justify-between"><span>Price:</span> <strong>{payload?.price} EUR</strong></div>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => onAction({ action: 'confirm' })} disabled={isLoading} className="w-full">
            {t('common.save')}
          </Button>
           <Button variant="outline" onClick={() => onAction({ action: 'cancel' })} disabled={isLoading} className="w-full">
            {t('common.cancel')}
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
