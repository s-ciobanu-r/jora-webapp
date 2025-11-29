import { useState } from 'react';
import { useTranslation } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface Props {
  stage: string;
  options?: any[];
  onAction: (params: any) => void;
  isLoading: boolean;
}

export function BuyerLookup({ stage, options, onAction, isLoading }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  if (stage === 'buyer_lookup_confirm_multi' && options) {
    return (
      <div className="space-y-4">
        <CardHeader><CardTitle>Select Buyer</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {options.map((opt: any) => (
            <Button key={opt.value} variant="outline" className="w-full justify-start" onClick={() => onAction({ choice: opt.value })}>
              {opt.label}
            </Button>
          ))}
          <Button variant="secondary" className="w-full" onClick={() => onAction({ action: 'create_new' })}>
            + Create New Buyer
          </Button>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>{t('buyers.searchBuyers')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by name..."
          />
          <Button onClick={() => onAction({ message: search })} disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="link" onClick={() => onAction({ action: 'create_new' })}>
          Or create a new buyer
        </Button>
      </CardContent>
    </div>
  );
}
