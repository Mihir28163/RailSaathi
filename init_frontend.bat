@echo off
cd /d "c:\Users\karan kumar chotrani.000\OneDrive\Desktop\RailSaathi"
echo "Initializing Next.js..."
call npx -y create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
echo "Installing dependencies..."
cd frontend
call npm install framer-motion recharts lucide-react clsx tailwind-merge
echo "Frontend init complete."
