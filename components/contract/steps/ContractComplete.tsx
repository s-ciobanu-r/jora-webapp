import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function ContractComplete() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-center py-8">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <CardHeader>
        <CardTitle className="text-2xl">{t('contract.contractCreated')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{t('contract.contractSaved')}</p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button>{t('common.dashboard')}</Button>
          </Link>
          <Link href="/contracts/new">
            <Button variant="outline">{t('common.startNewContract')}</Button>
          </Link>
        </div>
      </CardContent>
    </div>
  );
}
