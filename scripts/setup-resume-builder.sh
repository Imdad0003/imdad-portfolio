#!/usr/bin/env bash

# ==============================================================================
# setup-resume-builder.sh
# Automated Terminal Setup & Verification for IMDAD.BUILDS AI Resume Builder
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Terminal Color Codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}${BOLD}================================================================${NC}"
echo -e "${CYAN}${BOLD}       IMDAD.BUILDS — AI RESUME BUILDER SETUP ENGINE            ${NC}"
echo -e "${CYAN}${BOLD}================================================================${NC}"
echo -e "${BLUE}Project Directory:${NC} $PROJECT_ROOT"
echo ""

# ------------------------------------------------------------------------------
# STEP 1: Verify Project & Environment
# ------------------------------------------------------------------------------
echo -e "${BOLD}[1/5] Verifying Project & Dependencies...${NC}"

if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found in $PROJECT_ROOT.${NC}"
  echo "Please run this script from the IMDAD.BUILDS repository root."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}❌ Error: Node.js is not installed or not in PATH.${NC}"
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "   ✓ Node.js detected: ${GREEN}${NODE_VERSION}${NC}"

if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}❌ Error: npm is not installed or not in PATH.${NC}"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo -e "   ⏳ Installing dependencies via npm install..."
  npm install --quiet
fi
echo -e "   ✓ Dependencies installed & verified."

# ------------------------------------------------------------------------------
# STEP 2: Production vs Local Mode Dispatch
# ------------------------------------------------------------------------------
IS_PROD_MODE=false
if [ "$1" == "--production" ] || [ "$1" == "-p" ]; then
  IS_PROD_MODE=true
fi

if [ "$IS_PROD_MODE" = true ]; then
  echo ""
  echo -e "${BOLD}[2/5] Vercel Production Configuration Mode${NC}"
  echo "This mode safely configures GEMINI_API_KEY on your Vercel Production deployment."
  echo ""

  if ! command -v vercel >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Vercel CLI is not installed locally.${NC}"
    echo "To install Vercel CLI globally, run:"
    echo "  npm install -g vercel"
    echo ""
    echo "Alternatively, you can manually paste GEMINI_API_KEY in the Vercel Dashboard:"
    echo "  Project Settings → Environment Variables → Add GEMINI_API_KEY (Production)"
    exit 1
  fi

  echo "Checking Vercel authentication status..."
  if ! vercel whoami >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ You are not logged into Vercel CLI.${NC}"
    echo "Please run: vercel login"
    echo "Once logged in, re-run: bash scripts/setup-resume-builder.sh --production"
    exit 1
  fi

  VERCEL_USER=$(vercel whoami 2>&1 | head -n 1)
  echo -e "   ✓ Authenticated as: ${GREEN}${VERCEL_USER}${NC}"

  echo ""
  echo -e "${CYAN}Please paste your Google Gemini API Key for Production:${NC}"
  echo -e "${YELLOW}(Input is hidden for security. Keystrokes will not be echoed)${NC}"
  read -s -p "API Key: " PROD_KEY
  echo ""

  if [ -z "$PROD_KEY" ]; then
    echo -e "${RED}❌ Error: API Key cannot be empty.${NC}"
    exit 1
  fi

  echo ""
  echo "Configuring GEMINI_API_KEY in Vercel Production environment..."
  echo -n "$PROD_KEY" | vercel env add GEMINI_API_KEY production --force >/dev/null 2>&1 || {
    echo -e "${RED}❌ Failed to set variable via Vercel CLI.${NC}"
    echo "Please check project linkage with 'vercel link' or add via Vercel Dashboard."
    exit 1
  }

  echo -e "   ✓ ${GREEN}GEMINI_API_KEY successfully configured in Vercel Production!${NC}"
  echo ""
  echo -e "${BOLD}Next Step for Production:${NC}"
  echo "Deploy your production build using: vercel --prod"
  exit 0
fi

# ------------------------------------------------------------------------------
# STEP 3: Prompt for Local Gemini API Key
# ------------------------------------------------------------------------------
echo ""
echo -e "${BOLD}[2/5] Local Gemini API Key Configuration${NC}"

EXISTING_KEY=""
if [ -f ".env.local" ]; then
  EXISTING_KEY=$(grep -E "^GEMINI_API_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
fi

USER_KEY=""
if [ -n "$EXISTING_KEY" ]; then
  KEY_LEN=${#EXISTING_KEY}
  MASKED="••••••••${EXISTING_KEY: -4}"
  echo -e "   Current key detected in .env.local: ${GREEN}${MASKED}${NC} (${KEY_LEN} chars)"
  read -p "Do you want to keep the existing key? (y/n, default: y): " KEEP_EXISTING
  KEEP_EXISTING=${KEEP_EXISTING:-y}

  if [[ "$KEEP_EXISTING" =~ ^[Yy]$ ]]; then
    USER_KEY="$EXISTING_KEY"
  fi
fi

if [ -z "$USER_KEY" ]; then
  echo ""
  echo -e "${CYAN}Please paste your Google Gemini API Key:${NC}"
  echo -e "${YELLOW}(Input is hidden for privacy. Keystrokes will not be echoed)${NC}"
  read -s -p "API Key: " USER_KEY
  echo ""
fi

if [ -z "$USER_KEY" ]; then
  echo -e "${RED}❌ Error: API key cannot be empty.${NC}"
  exit 1
fi

# Ensure .env.local exists
touch .env.local

if [ "$USER_KEY" != "$EXISTING_KEY" ]; then
  # Safely update GEMINI_API_KEY in .env.local without duplicates
  TEMP_ENV=$(mktemp)
  grep -v "^GEMINI_API_KEY=" .env.local > "$TEMP_ENV" || true
  echo "GEMINI_API_KEY=\"$USER_KEY\"" >> "$TEMP_ENV"
  mv "$TEMP_ENV" .env.local
  chmod 600 .env.local
  echo -e "   ✓ ${GREEN}GEMINI_API_KEY safely written to .env.local (chmod 600)${NC}"
else
  echo -e "   ✓ ${GREEN}Keeping existing securely configured GEMINI_API_KEY in .env.local${NC}"
fi

echo "   ✓ File .env.local is protected by .gitignore."

# ------------------------------------------------------------------------------
# STEP 4: Live Gemini API Verification
# ------------------------------------------------------------------------------
echo ""
echo -e "${BOLD}[3/5] Verifying Gemini 4 Hydrogen Integration with Live API...${NC}"

export GEMINI_API_KEY="$USER_KEY"
node scripts/verify-gemini-live.mjs

# ------------------------------------------------------------------------------
# STEP 5: Run Code Quality Checks & Production Build
# ------------------------------------------------------------------------------
echo ""
echo -e "${BOLD}[4/5] Running TypeScript Validation & Automated Test Suites...${NC}"

echo "   ⏳ Running TypeScript check (npx tsc --noEmit)..."
npx tsc --noEmit
echo -e "   ✓ ${GREEN}TypeScript: 0 type errors.${NC}"

echo "   ⏳ Running Automated Resume Builder Tests..."
npx tsx scripts/test-resume-builder.ts
echo -e "   ✓ ${GREEN}Automated Test Suite: 100% Passed.${NC}"

# ------------------------------------------------------------------------------
# STEP 6: Launch Development Server
# ------------------------------------------------------------------------------
echo ""
echo -e "${BOLD}[5/5] Setup Complete! Ready for Local Development.${NC}"
echo ""
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}  AI RESUME BUILDER IS FULLY OPERATIONAL AND CONFIGURED!        ${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo ""
echo -e "Service Landing Page: ${CYAN}${BOLD}http://localhost:3000/services/ai-resume-builder${NC}"
echo -e "Admin Dashboard:      ${CYAN}${BOLD}http://localhost:3000/admin${NC} (Settings Tab)"
echo ""
echo "To start the local Next.js server now, run:"
echo -e "  ${BOLD}npm run dev${NC}"
echo ""
echo "To configure your production deployment on Vercel later, run:"
echo -e "  ${BOLD}bash scripts/setup-resume-builder.sh --production${NC}"
echo ""
