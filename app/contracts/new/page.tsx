import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, ChevronLeft, RefreshCw } from 'lucide-react';
import { useContractSession } from '../../hooks/useContractSession';
import { StepIndicator } from './StepIndicator';
import { ContractNumberStep } from './steps/ContractNumberStep';
import { ContractDateStep } from './steps/ContractDateStep';
import { InputModeStep } from './steps/InputModeStep';
import { OCRUploader } from './steps/OCRUploader';
import { OCRReview } from './steps/OCRReview';
import { VehicleDataStep } from './steps/VehicleDataStep';
import { BuyerLookup } from './steps/BuyerLookup';
import { BuyerDataStep } from './steps/BuyerDataStep';
import { PriceStep } from './steps/PriceStep';
import { SummaryReview } from './steps/SummaryReview';
import { ContractComplete } from './steps/ContractComplete';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
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
const stageGroups = {
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

export function ContractFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      // Load existing contract
      sendAction({ action: 'load', contract_id: id });
    } else if (!session) {
      // Initialize new session
      initSession();
    }
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
  }, [session?.session_expired]);

  // Get current stage component
  const StageComponent = stage ? stageComponents[stage] : null;

  // Calculate progress percentage
  const getProgress = () => {
    if (!stage) return 0;
    
    for (const [group, stages] of Object.entries(stageGroups)) {
      const index = stages.indexOf(stage);
      if (index !== -1) {
        const groupIndex = Object.keys(stageGroups).indexOf(group);
        const groupProgress = (index + 1) / stages.length;
        const baseProgress = (groupIndex / Object.keys(stageGroups).length) * 100;
        const groupWeight = 100 / Object.keys(stageGroups).length;
        return Math.round(baseProgress + (groupProgress * groupWeight));
      }
    }
    return 0;
  };

  // Handle restart
  const handleRestart = () => {
    if (window.confirm('Are you sure you want to restart? All progress will be lost.')) {
      sendAction({ message: 'restart' });
      toast.success('Restarted contract creation');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    sendAction({ action: 'go_back' });
  };

  // Loading state
  if (!session && !isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Jora Contract System
              </h1>
              {session?.session_id && (
                <span className="ml-4 text-sm text-gray-500">
                  Session: {session.session_id.slice(0, 8)}...
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="text-gray-500"
              >
                Debug {showDebug ? 'Off' : 'On'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Restart
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <StepIndicator 
            currentStage={stage || 'choose_contract_number'} 
            progress={getProgress()}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stage Area */}
          <div className="lg:col-span-2">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {reply && (
              <Alert className="mb-6">
                <AlertDescription>{reply}</AlertDescription>
              </Alert>
            )}

            <Card className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
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
                    <div className="text-center py-8">
                      <p className="text-gray-500">Unknown stage: {stage}</p>
                      <Button
                        onClick={handleRestart}
                        className="mt-4"
                      >
                        Restart Process
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Contract Summary</h3>
              <div className="space-y-2 text-sm">
                {payload?.contract_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contract #:</span>
                    <span className="font-medium">{payload.contract_number}</span>
                  </div>
                )}
                {payload?.contract_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{payload.contract_date}</span>
                  </div>
                )}
                {payload?.brand_model && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle:</span>
                    <span className="font-medium">{payload.brand_model}</span>
                  </div>
                )}
                {payload?.buyer_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Buyer:</span>
                    <span className="font-medium">{payload.buyer_name}</span>
                  </div>
                )}
                {payload?.price && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">{payload.price} EUR</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Type "back" to go to previous step</p>
                <p>• Type "restart" to start over</p>
                <p>• All data is saved automatically</p>
              </div>
            </Card>

            {/* Debug Panel */}
            {showDebug && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Debug Info</h3>
                <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
                  {JSON.stringify({
                    stage,
                    session_id: session?.session_id,
                    payload,
                    options,
                  }, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
