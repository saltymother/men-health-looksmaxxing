#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🚀 Pushing Men Health and Looksmaxxing to GitHub..."
git push -u origin main
git push -u origin gh-pages

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Push successful!"
  echo "🌐 Repository: https://github.com/saltymother/men-health-looksmaxxing"
  echo "📄 GitHub Pages will be live shortly at: https://saltymother.github.io/men-health-looksmaxxing/"
else
  echo ""
  echo "❌ Push failed. Please make sure the repository 'men-health-looksmaxxing' is created at https://github.com/new"
fi
