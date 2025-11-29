import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/config';

interface StepIndicatorProps {
  currentStage: string;
  progress: number;
}

export function StepIndicator({ currentStage, progress }: StepIndicatorProps) {
  const { t } = useTranslation();

  // Simple visual representation of progress
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-2">
        <span>{t('contract.progressSteps')}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-center text-muted-foreground mt-2">
        {currentStage.replace(/_/g, ' ')}
      </div>
    </div>
  );
}
