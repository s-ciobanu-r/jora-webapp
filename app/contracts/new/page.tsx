'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/i18n/config';
import api, { ContractSessionResponse } from '@/lib/apiClient';
import { 
  RotateCcw, 
  Bug, 
  Send, 
  ChevronLeft,
  FileText,
  User,
  Car,
  DollarSign,
  Calendar,
  Hash,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';

// Generate unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Message type for chat history
interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: { label: string; value: string }[];
}

// Stage progress mapping
const stageProgress: Record<string, number> = {
  'choose_contract_number': 5,
  'contract_number_confirm': 10,
  'contract_date': 15,
  'contract_date_confirm': 20,
  'vehicle_entry_method': 25,
  'vehicle_ocr_upload': 30,
  'vehicle_ocr_confirm': 35,
  'vehicle_manual_brand': 40,
  'vehicle_manual_vin': 45,
  'vehicle_manual_km': 50,
  'vehicle_manual_registration': 55,
  'vehicle_confirm': 60,
  'buyer_entry_method': 65,
  'buyer_search': 70,
  'buyer_select': 75,
  'buyer_manual': 80,
  'buyer_confirm': 85,
  'price_entry': 90,
  'summary_confirm': 95,
  'complete': 100,
  'session_expired': 0,
};

// Stage display names
const stageNames: Record<string, string> = {
  'choose_contract_number': 'CHOOSE CONTRACT NUMBER',
  'contract_number_confirm': 'CONFIRM CONTRACT NUMBER',
  'contract_date': 'CONTRACT DATE',
  'contract_date_confirm': 'CONFIRM DATE',
  'vehicle_entry_method': 'VEHICLE ENTRY',
  'vehicle_ocr_upload': 'UPLOAD VEHICLE DOCS',
  'vehicle_ocr_confirm': 'CONFIRM OCR DATA',
  'vehicle_manual_brand': 'VEHICLE BRAND/MODEL',
  'vehicle_manual_vin': 'VEHICLE VIN',
  'vehicle_manual_km': 'VEHICLE MILEAGE',
  'vehicle_manual_registration': 'FIRST REGISTRATION',
  'vehicle_confirm': 'CONFIRM VEHICLE',
  'buyer_entry_method': 'BUYER ENTRY',
  'buyer_search': 'SEARCH BUYER',
  'buyer_select': 'SELECT BUYER',
  'buyer_manual': 'ENTER BUYER DATA',
  'buyer_confirm': 'CONFIRM BUYER',
  'price_entry': 'ENTER PRICE',
  'summary_confirm': 'REVIEW & CONFIRM',
  'complete': 'CONTRACT COMPLETE',
  'session_expired': 'SESSION EXPIRED',
};

export default function ContractCreationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  
  // State
  const [sessionId, setSessionId] = useState<string>('');
  const [stage, setStage] = useState<string>('choose_contract_number');
  const [payload, setPayload] = useState<any>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<{ label: string; value: string }[]>([]);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize session on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    // Start the conversation
    initializeSession(newSessionId);
  }, [isAuthenticated, router]);
  
  // Initialize session with n8n
  const initializeSession = async (sid: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.contractSession.send({
        user_id: user?.user_id,
        session_id: sid,
        message: '',
        action: 'start',
      });
      
      handleResponse(response);
    } catch (err: any) {
      console.error('Failed to initialize session:', err);
      setError('Failed to connect to server. Please try again.');
      addBotMessage('Eroare la conectarea la server. Vă rugăm să reîncercați.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle n8n response
  const handleResponse = (response: ContractSessionResponse) => {
    setStage(response.stage);
    setPayload(response.payload || {});
    setCurrentOptions(response.options || []);
    
    if (response.reply) {
      addBotMessage(response.reply, response.options);
    }
    
    if (response.session_expired) {
      setError('Session expired. Please start a new contract.');
    }
  };
  
  // Add bot message to chat
  const addBotMessage = (content: string, options?: { label: string; value: string }[]) => {
    const message: ChatMessage = {
      id: `bot_${Date.now()}`,
      role: 'bot',
      content,
      timestamp: new Date(),
      options,
    };
    setMessages(prev => [...prev, message]);
  };
  
  // Add user message to chat
  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };
  
  // Send message to n8n
  const sendMessage = async (message?: string, action?: string, fileUrl?: string) => {
    if (isLoading) return;
    
    const msg = message || inputValue.trim();
    if (!msg && !action && !fileUrl) return;
    
    setIsLoading(true);
    setError(null);
    setInputValue('');
    setCurrentOptions([]);
    
    if (msg && !action) {
      addUserMessage(msg);
    }
    
    try {
      const response = await api.contractSession.send({
        user_id: user?.user_id,
        session_id: sessionId,
        message: msg || undefined,
        action: action || undefined,
        file_url: fileUrl || undefined,
      });
      
      handleResponse(response);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      addBotMessage('Eroare la trimiterea mesajului. Vă rugăm să reîncercați.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle option click
  const handleOptionClick = (value: string, label: string) => {
    addUserMessage(label);
    sendMessage(undefined, value);
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('session_id', sessionId);
      
      // Simulate upload progress (in real implementation, use actual upload)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // For now, create a data URL as file_url
      // In production, you'd upload to a storage service
      const reader = new FileReader();
      reader.onload = async () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        const base64Url = reader.result as string;
        
        // Send to n8n with file URL
        await sendMessage(undefined, 'file_uploaded', base64Url);
        
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      };
      reader.readAsDataURL(selectedFile);
      
    } catch (err) {
      console.error('File upload failed:', err);
      setError('File upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Restart contract creation
  const handleRestart = async () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMessages([]);
    setPayload({});
    setCurrentOptions([]);
    setError(null);
    setSelectedFile(null);
    
    await initializeSession(newSessionId);
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Progress percentage
  const progress = stageProgress[stage] || 0;
  const stageName = stageNames[stage] || stage.toUpperCase().replace(/_/g, ' ');
  
  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Contract Creation</h1>
          <span className="px-3 py-1 text-xs font-mono bg-muted rounded-md text-muted-foreground">
            ID: {sessionId.slice(0, 12)}...
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
              showDebug 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            <Bug className="w-4 h-4" />
            Debug {showDebug ? 'On' : 'Off'}
          </button>
          
          <button
            onClick={handleRestart}
            className="px-3 py-2 text-sm bg-muted text-muted-foreground hover:bg-accent rounded-lg flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{t('contract.progressSteps')}</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground tracking-wider uppercase">
          {stageName}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl flex flex-col h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Initializing...
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Options buttons */}
                  {message.role === 'bot' && message.options && message.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleOptionClick(option.value, option.label)}
                          disabled={isLoading || currentOptions.length === 0}
                          className="px-3 py-1.5 text-sm bg-background text-foreground border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">{t('contract.botTyping')}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* File Upload Area (shown when needed) */}
          {stage.includes('ocr') && stage.includes('upload') && (
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="flex-1 flex items-center gap-3 bg-muted rounded-lg p-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Click to upload document</span>
                  </button>
                )}
                
                {selectedFile && (
                  <button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => sendMessage('înapoi', 'go_back')}
                disabled={isLoading || stage === 'choose_contract_number'}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                title="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('contract.sendMessage')}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              />
              
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Contract Summary Sidebar */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">Contract Summary</h2>
          
          <div className="space-y-4">
            {/* Contract Number */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Hash className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Contract #</p>
                <p className="text-sm font-medium text-foreground">
                  {payload.contract_number || '-'}
                </p>
              </div>
            </div>
            
            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">
                  {payload.contract_date || '-'}
                </p>
              </div>
            </div>
            
            {/* Vehicle */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Car className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Vehicle</p>
                <p className="text-sm font-medium text-foreground">
                  {payload.vehicle_brand_model || '-'}
                </p>
                {payload.vehicle_vin && (
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    VIN: {payload.vehicle_vin}
                  </p>
                )}
              </div>
            </div>
            
            {/* Buyer */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <User className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Buyer</p>
                <p className="text-sm font-medium text-foreground">
                  {payload.buyer_name || '-'}
                </p>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-sm font-medium text-foreground">
                  {payload.price ? `${payload.price} RON` : '-'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {/* Success Display */}
          {stage === 'complete' && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm text-green-500">Contract created successfully!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug Panel */}
      {showDebug && (
        <div className="mt-6 bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Debug Payload</h3>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto text-muted-foreground">
            {JSON.stringify({ stage, sessionId, payload }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
