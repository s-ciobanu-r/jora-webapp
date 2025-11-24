# 🚀 Jora Frontend Setup Guide

## Quick Start

### 1. Create React Project with Vite
```bash
npm create vite@latest jora-frontend -- --template react-ts
cd jora-frontend
```

### 2. Install Dependencies
```bash
# Copy the package.json I provided, then:
npm install
```

### 3. Setup Tailwind CSS
```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 4. Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
```

### 5. Create Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5678/webhook
VITE_AUTH_ENABLED=true
VITE_FILE_UPLOAD_URL=http://localhost:5678/upload
VITE_WEBSOCKET_URL=ws://localhost:5678/ws
```

### 6. Project Structure
```
jora-frontend/
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── components/
│   │   ├── contract/
│   │   │   ├── ContractFlow.tsx ✅ (provided)
│   │   │   ├── StepIndicator.tsx
│   │   │   └── steps/
│   │   │       ├── ContractNumberStep.tsx
│   │   │       ├── ContractDateStep.tsx
│   │   │       ├── InputModeStep.tsx
│   │   │       ├── OCRUploader.tsx
│   │   │       ├── VehicleDataStep.tsx
│   │   │       ├── BuyerLookup.tsx
│   │   │       ├── BuyerDataStep.tsx
│   │   │       ├── PriceStep.tsx
│   │   │       ├── SummaryReview.tsx
│   │   │       └── ContractComplete.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── alert.tsx
│   │   │   └── skeleton.tsx
│   │   ├── layout/
│   │   │   └── Layout.tsx
│   │   └── auth/
│   │       ├── Login.tsx
│   │       └── ProtectedRoute.tsx
│   ├── hooks/
│   │   └── useContractSession.ts ✅ (provided)
│   ├── store/
│   │   ├── sessionStore.ts
│   │   └── authStore.ts
│   ├── types/
│   │   └── contract.types.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── App.tsx ✅ (provided)
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json ✅ (provided)
├── tsconfig.json
├── vite.config.ts
└── .env
```

## 🔧 Implementation Steps

### Step 1: API Client Setup
Create `src/api/client.ts`:
```typescript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5678/webhook';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Step 2: Create Zustand Stores

`src/store/sessionStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionStore {
  sessionId: string | null;
  setSessionId: (id: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (id) => set({ sessionId: id }),
      clearSession: () => set({ sessionId: null }),
    }),
    {
      name: 'jora-session',
    }
  )
);
```

`src/store/authStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'jora-auth',
    }
  )
);
```

### Step 3: Create UI Components
Install shadcn/ui components:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input alert skeleton
```

### Step 4: Create Contract Step Components

Example: `src/components/contract/steps/ContractNumberStep.tsx`:
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Props {
  stage: string;
  payload: any;
  options: string[];
  onAction: (params: any) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ContractNumberStep({ payload, onAction, onBack, isLoading }: Props) {
  const [contractNumber, setContractNumber] = useState('');
  const [useAuto, setUseAuto] = useState(true);

  const handleSubmit = () => {
    if (useAuto) {
      onAction({ action: 'select_number', choice: 'auto' });
    } else {
      onAction({ action: 'select_number', message: contractNumber });
    }
  };

  const suggestedNumber = payload?.suggested_number || '1';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Contract Number</h2>
        <p className="text-gray-600">Choose a contract number for this agreement</p>
      </div>

      <div className="space-y-4">
        <Card 
          className={`p-4 cursor-pointer border-2 ${useAuto ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
          onClick={() => setUseAuto(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-generate</p>
              <p className="text-sm text-gray-600">
                Suggested: {suggestedNumber}
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full ${useAuto ? 'bg-blue-500' : 'border-2 border-gray-300'}`} />
          </div>
        </Card>

        <Card 
          className={`p-4 cursor-pointer border-2 ${!useAuto ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
          onClick={() => setUseAuto(false)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enter manually</p>
              <p className="text-sm text-gray-600">
                Specify your own number
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full ${!useAuto ? 'bg-blue-500' : 'border-2 border-gray-300'}`} />
          </div>
        </Card>

        {!useAuto && (
          <Input
            placeholder="Enter contract number"
            value={contractNumber}
            onChange={(e) => setContractNumber(e.target.value)}
            className="mt-2"
          />
        )}
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || (!useAuto && !contractNumber)}
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
```

### Step 5: Test Your Setup

1. **Start n8n workflow**:
```bash
# Make sure your n8n workflow is running on port 5678
n8n start
```

2. **Start frontend dev server**:
```bash
npm run dev
```

3. **Test the connection**:
- Open http://localhost:5173
- Check console for any errors
- Try creating a contract

## 🎯 Next Steps

### Backend Improvements to Implement:
1. **Add authentication** - Implement JWT validation in n8n
2. **Add rate limiting** - Use Redis or in-memory store
3. **Add logging** - Create activity_logs table
4. **Add file upload endpoint** - For OCR documents

### Frontend Features to Add:
1. **Error boundary** - Catch and display errors gracefully
2. **PWA support** - Add service worker for offline
3. **Dark mode** - Add theme toggle
4. **Internationalization** - Support German/Romanian
5. **Print support** - Add print styles for contracts

## 📝 Common Issues & Solutions

### CORS Issues
Add to n8n webhook node:
```javascript
responseHeaders: {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

### Session Expiration
Handle in frontend:
```typescript
if (response.data.session_expired) {
  toast.error('Session expired');
  resetSession();
  initSession();
}
```

### File Upload
Implement file upload service:
```typescript
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.url;
}
```

## 🚢 Production Deployment

### Build for Production
```bash
npm run build
```

### Docker Setup
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration
```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
      }
    }
  }
});
```

## Ready to Code! 🎉

You now have:
- ✅ Complete frontend architecture
- ✅ API integration setup
- ✅ State management configured
- ✅ Component templates ready
- ✅ Build and deployment pipeline

Start building your frontend and let me know if you need help with any specific component!
