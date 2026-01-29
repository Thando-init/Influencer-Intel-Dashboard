# Quick Start Guide

Get the Influencer Intel Dashboard running locally in 5 minutes!

---

## Prerequisites

- Node.js 22+ installed
- Python 3.11+ installed
- pnpm installed (`npm install -g pnpm`)
- YouTube Data API key ([Get one here](https://console.cloud.google.com/apis/credentials))

---

## Step 1: Clone & Navigate

```bash
git clone https://github.com/Thando-init/Influencer-Intel-Dashboard.git
cd Influencer-Intel-Dashboard
```

---

## Step 2: Start Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set YouTube API key
export YOUTUBE_API_KEY=your_youtube_api_key_here
# On Windows:
# set YOUTUBE_API_KEY=your_youtube_api_key_here
set YOUTUBE_API_KEY="AIzaSyC8sBmAi020_K3ERy-N4Rw0hDOArJJMWwo"

# Start backend
uvicorn app.main:app --reload --port 8000
```

✅ Backend running at `http://localhost:8000`

---

## Step 3: Start Frontend (Terminal 2)

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Start frontend
pnpm dev
```

✅ Frontend running at `http://localhost:3000`

---

## Step 4: Test the Application

### Create an Account

1. Open `http://localhost:3000` in your browser
2. Click "Open the app" or go to `/signup`
3. Fill in the form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: password123
4. Click "Create account"
5. You'll be redirected to login

### Login

1. Enter your credentials:
   - **Email**: test@example.com
   - **Password**: password123
2. Click "Sign in"
3. You'll be redirected to `/app/analyse`

### Run Your First Analysis

1. Paste a YouTube channel URL, for example:
   ```
   https://www.youtube.com/@MrBeast
   ```
2. Set video count to `8`
3. (Optional) Fill in brand inputs:
   - Client currency: `USD`
   - Creator currency: `USD`
   - Quoted fee: `10000`
   - Agency margin: `30`
   - Target CPM: `100`
4. Click "Run analysis"
5. Wait for the analysis to complete
6. View the comprehensive report with:
   - Channel performance card
   - Metrics summary
   - Interactive charts
   - Video breakdown table

---

## Step 5: Explore Features

### View Saved Analyses
- Click "Saved" in the sidebar
- See all your analyses
- Click one to make it active

### Use the Calculator
- Click "Calculator" in the sidebar
- Try Mode 1 (manual input)
- Try Mode 2 (uses active analysis)

### Check Pricing
- Go to `/pricing`
- View subscription plans
- (Note: PayPal is in demo mode)

### Toggle Theme
- Click "Dark" or "Light" button in sidebar
- Theme persists across sessions

---

## Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Make sure you activated the virtual environment and ran `pip install -r requirements.txt`

**Error:** `YouTube API key not found`
- **Solution**: Set the environment variable:
  ```bash
  export YOUTUBE_API_KEY=your_key_here
  ```

### Frontend won't start

**Error:** `Cannot find module 'next'`
- **Solution**: Run `pnpm install` in the frontend directory

**Error:** `Port 3000 already in use`
- **Solution**: Kill the process using port 3000 or use a different port:
  ```bash
  pnpm dev -- -p 3001
  ```

### Analysis fails

**Error:** `API error (500)`
- **Solution**: Check backend logs in Terminal 1
- Verify YouTube API key is valid
- Check if YouTube URL is correct

**Error:** `Network error`
- **Solution**: Make sure backend is running on port 8000
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### Charts not showing

**Error:** Charts are blank
- **Solution**: Make sure the analysis returned video data
- Check browser console for errors
- Try a different YouTube channel

---

## Next Steps

Now that you have it running locally:

1. **Customize the UI**: Edit components in `frontend/components/`
2. **Add Features**: Extend the analysis engine in `backend/src/analysis/`
3. **Deploy**: Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. **Set Up PayPal**: Configure real subscription plans
5. **Add Database**: Migrate from in-memory to PostgreSQL

---

## Useful Commands

### Backend

```bash
# Run tests
pytest

# Check code style
flake8

# Format code
black .

# Start with specific port
uvicorn app.main:app --port 8080
```

### Frontend

```bash
# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm type-check
```

---

## Demo Data

### Test YouTube Channels

Try these channels for testing:

- **MrBeast**: `https://www.youtube.com/@MrBeast`
- **Marques Brownlee**: `https://www.youtube.com/@mkbhd`
- **Veritasium**: `https://www.youtube.com/@veritasium`
- **Linus Tech Tips**: `https://www.youtube.com/@LinusTechTips`

### Test Credentials

Since we're using in-memory storage, you can create any account:

- Email: `test@example.com`
- Password: `password123`

**Note**: Data is lost when the server restarts.

---

## Getting Help

- **Documentation**: See [README.md](./README_NEW.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/Thando-init/Influencer-Intel-Dashboard/issues)

---

**Happy analyzing!** 🚀
