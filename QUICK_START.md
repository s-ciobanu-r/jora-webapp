# 🚀 JORA FRONTEND - QUICK START GUIDE

## Installation & Setup (5 minutes)

### 1️⃣ Install Dependencies
```bash
cd jora-frontend
npm install
```

### 2️⃣ Configure Environment
```bash
# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your n8n details:
NEXT_PUBLIC_JORA_API_BASE=https://johnbaton.app.n8n.cloud/webhook/api
NEXT_PUBLIC_JORA_FRONTEND_API_KEY=your_api_key_here
```

### 3️⃣ Start Development Server
```bash
npm run dev
```

Open browser: http://localhost:3000

## 🔐 Default Login Credentials
- Username: `admin`
- Password: `jora123`

## 📱 Main Features

### Contract Creation (/contracts/new)
1. Click "Contract nou" button
2. Follow chat prompts
3. Enter contract details or use OCR
4. Review and confirm
5. Download generated PDF

### Buyer Management (/buyers)
- Search buyers by name
- Add new buyers
- Edit existing buyer info
- View buyer history

## 🌐 Language Switching
Click globe icon (🌍) in header to switch between:
- 🇷🇴 Romanian (default)
- 🇩🇪 German
- 🇬🇧 English  
- 🇷🇺 Russian

## 🎨 Theme Toggle
Click sun/moon icon to switch between light/dark themes

## ⚠️ Important Notes

### Backend Requirements
Your n8n workflows MUST:
1. Accept `joraapikey` header for authentication
2. Have these endpoints configured:
   - POST `/contract-session`
   - GET/POST/PATCH `/buyers`
   - POST `/jora-login`
   - GET `/jora-last-contract`

### CORS Configuration
n8n webhooks must return:
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, joraapikey'
}
```

## 🐛 Common Issues & Fixes

### ❌ "Authentication failed" error
✅ Check `NEXT_PUBLIC_JORA_FRONTEND_API_KEY` matches n8n configuration

### ❌ "Network Error" on API calls  
✅ Verify `NEXT_PUBLIC_JORA_API_BASE` URL is correct
✅ Check n8n workflows are active

### ❌ Session expires quickly
✅ Sessions expire after 15 minutes (configured in n8n)
✅ Click "Continue Contract" to resume

### ❌ Language not saving
✅ Clear browser cache and localStorage
✅ Refresh page after language change

## 📞 Need Help?
1. Check browser console for errors (F12)
2. Verify n8n workflows are running
3. Ensure all environment variables are set
4. Test n8n endpoints directly with curl/Postman

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)
```bash
npx vercel
```

### Deploy with Docker
```bash
docker build -t jora-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_JORA_API_BASE=... jora-frontend
```

---

💡 **Pro Tip**: Keep browser DevTools open (F12) to monitor API calls and debug issues quickly.

📌 **Remember**: The chat replies remain in Romanian regardless of UI language setting (backend limitation).
