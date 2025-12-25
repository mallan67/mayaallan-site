#!/bin/bash

echo "🚀 Creating Fresh complete-site-v2 Branch"
echo "=========================================="
echo ""

cd /workspaces/mayaallan-site

# Step 1: Go to main
echo "1️⃣  Switching to main..."
git checkout main
echo ""

# Step 2: Create new branch
echo "2️⃣  Creating fresh complete-site-v2 branch..."
git checkout -b complete-site-v2
echo ""

# Step 3: Create .gitignore
echo "3️⃣  Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
.pnpm-store/
.next/
.env*.local
.vercel
*.tsbuildinfo
next-env.d.ts
*.db
.DS_Store
EOF
echo "✅ .gitignore created"
echo ""

# Step 4: Add all files
echo "4️⃣  Adding files..."
git add .
echo ""

# Step 5: Check what's being added
echo "5️⃣  Files to commit: $(git diff --cached --name-only | wc -l)"
echo ""
echo "Checking for .pnpm-store (should be none):"
git diff --cached --name-only | grep pnpm-store || echo "✅ No .pnpm-store files!"
echo ""

# Step 6: Commit
echo "6️⃣  Committing..."
git commit -m "Complete site v2 - all project files"
echo ""

# Step 7: Push
echo "7️⃣  Pushing to GitHub..."
git push origin complete-site-v2
echo ""
echo "🎉 Done!"
