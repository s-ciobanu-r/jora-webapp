'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useContractSession } from '@/hooks/useContractSession';
import { StepIndicator } from '@/components/contract/StepIndicator';
import { ContractNumberStep } from '@/components/contract/steps/ContractNumberStep';
import { ContractDateStep } from '@/components/contract/steps/ContractDateStep';
import { InputModeStep } from '@/components/contract/steps/InputModeStep';
import { OCRUploader } from '@/components/contract/steps/OCRUploader';
import { OCRReview } from '@/components/contract/steps/OCRReview';
import { VehicleDataStep } from '@/components/contract/steps/VehicleDataStep';
import { BuyerLookup } from '@/components/contract/steps/BuyerLookup';
import { BuyerDataStep } from '@/components/contract/steps/BuyerDataStep';
import { PriceStep } from '@/components/contract/steps/PriceStep';
import { SummaryReview } from '@/components/contract/steps/SummaryReview';
import { ContractComplete } from '@/components/contract/steps/ContractComplete';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

// Map stages to their respective components
const stageComponents: Record<string, React.ComponentType<any>> = {
  'choose_contract_number': ContractNumberStep,
  'contract_number_confirm': ContractNumberStep,
  'contract_date': ContractDateStep,
  'contract_date_confirm': ContractDateStep,
  'choose_input_mode': InputModeStep,
  'choose_input_mode_confirm': InputModeStep,
  'ocr_wait_file_url': OCRUploader,
  'ocr_process_file_url': OCRUploader,
  'ocr_extract_raw': OCRUploader,
  'ocr_parse_structured': OCRUploader,
  'ocr_review': OCRReview,
  'ocr_review_confirm': OCRReview,
  'ocr_review_low_confidence': OCRReview,
  'ocr_review_partial': OCRReview,
  'vehicle_brand_model': VehicleDataStep,
  'vehicle_vin': VehicleDataStep,
  'vehicle_km': VehicleDataStep,
  'vehicle_first_reg': VehicleDataStep,
  'buyer_lookup_start': BuyerLookup,
  'buyer_lookup_process': BuyerLookup,
  'buyer_lookup_confirm_single': BuyerLookup,
  'buyer_lookup_confirm_multi': BuyerLookup,
  'buyer_name': BuyerDataStep,
  'buyer_street': BuyerDataStep,
  'buyer_city': BuyerDataStep,
  'buyer_address': BuyerDataStep,
  'buyer_phone': BuyerDataStep,
  'buyer_email': BuyerDataStep,
  'buyer_document_number': BuyerDataStep,
  'buyer_document_authority': BuyerDataStep,
  'price_input': PriceStep,
  'summary_review': SummaryReview,
  'summary_review_confirm': SummaryReview,
  'final_confirm': SummaryReview,
  'final_confirm_action': SummaryReview,
  'final_save_contract': ContractComplete,
  'process_finished': ContractComplete,
};

// Stage groups for progress tracking
const stageGroups: Record<string, string[]> = {
  setup: ['choose_contract_number', 'contract_number_confirm', 'contract_date', 'contract_date_confirm'],
  input: ['choose_input_mode', 'choose_input_mode_confirm'],
  ocr: ['ocr_wait_file_url', 'ocr_process_file_url', 'ocr_extract_raw', 'ocr_parse_structured', 
        'ocr_review', 'ocr_review_confirm', 'ocr_review_low_confidence', 'ocr_review_partial'],
  vehicle: ['vehicle_brand_model', 'vehicle_vin', 'vehicle_km', 'vehicle_first_reg'],
  buyer: ['buyer_lookup_start', 'buyer_lookup_process', 'buyer_lookup_confirm_single', 
          'buyer_lookup_confirm_multi', 'buyer_name', 'buyer_street', 'buyer_city', 
          'buyer_address', 'buyer_phone', 'buyer_email', 'buyer_document_number', 
          'buyer_document_authority'],
  pricing: ['price_input'],
  review: ['summary_review', 'summary_review_confirm', 'final_confirm', 'final_confirm_action'],
  complete: ['final_save_contract', 'process_finished'],
};

export default function ContractFlow() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const {
    session,
    stage,
    payload,
    reply,
    options,
    sendAction,
    isLoading,
    isError,
    initSession,
    resetSession,
  } = useContractSession();

  // Initialize or load session
  useEffect(() => {
    if (id) {
      sendAction({ action: 'load', contract_id: id });
    } else if (!session) {
      initSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle errors
  useEffect(() => {
    if (isError) {
      setError('Connection error. Please check your network and try again.');
      toast.error('Failed to connect to the server');
    }
  }, [isError]);

  // Handle session expiration
  useEffect(() => {
    if (session?.session_expired) {
      toast.error('Session expired. Starting a new session...');
      resetSession();
      initSession();
    }
  }, [session?.session_expired, resetSession, initSession]);

  // Get current stage component
  const StageComponent = stage ? stageComponents[stage] : null;

  // Calculate progress percentage
  const getProgress = () => {
    if (!stage) return 0;
    
    const groupKeys = Object.keys(stageGroups);
    for (const [group, stages] of Object.entries(stageGroups)) {
      const index = stages.indexOf(stage);
      if (index !== -1) {
        const groupIndex = groupKeys.indexOf(group);
        const groupProgress = (index + 1) / stages.length;
        const baseProgress = (groupIndex / groupKeys.length) * 100;
        const groupWeight = 100 / groupKeys.length;
        return Math.round(baseProgress + (groupProgress * groupWeight));
      }
    }
    return 0;
  };

  const handleRestart = () => {
    if (window.confirm('Are you sure you want to restart? All progress will be lost.')) {
      sendAction({ message: 'restart' });
      toast.success('Restarted contract creation');
    }
  };

  const handleBack = () => {
    sendAction({ action: 'go_back' });
  };

  if (!session && !isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold tracking-tight">Contract Creation</h1>
          {session?.session_id && (
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              ID: {session.session_id.slice(0, 8)}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-muted-foreground"
          >
            Debug {showDebug ? 'Off' : 'On'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <StepIndicator 
          currentStage={stage || 'choose_contract_number'} 
          progress={getProgress()}
        />
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {reply && (
            <Alert>
              <AlertDescription className="whitespace-pre-line">
                {reply}
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-6 relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage || 'loading'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {StageComponent ? (
                  <StageComponent
                    stage={stage}
                    payload={payload}
                    options={options}
                    onAction={sendAction}
                    onBack={handleBack}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      {stage ? `Unknown stage: ${stage}` : 'Initializing...'}
                    </p>
                    {stage && (
                      <Button onClick={handleRestart} variant="destructive">
                        Restart Process
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-lg">Contract Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Contract #:</span>
                <span className="font-medium">{payload?.contract_number || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{payload?.contract_date || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium text-right max-w-[60%] truncate">
                  {payload?.brand_model || '-'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Buyer:</span>
                <span className="font-medium text-right max-w-[60%] truncate">
                  {payload?.buyer_name || '-'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">
                  {payload?.price ? `${payload.price} EUR` : '-'}
                </span>
              </div>
            </div>
          </Card>

          {showDebug && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Debug Info</h3>
              <div className="relative">
                <pre className="text-xs overflow-auto max-h-96 bg-muted p-3 rounded border font-mono">
                  {JSON.stringify({ stage, session_id: session?.session_id, payload, options }, null, 2)}
                </pre>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
