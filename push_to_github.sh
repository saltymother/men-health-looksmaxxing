#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🚀 Pushing Men's Health & Looksmaxxing to GitHub..."
git push -u origin main
git push -u origin gh-pages

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Push successful!"
  echo "🌐 Your repository is live at: https://github.com/saltymother/men-health-looksmaxxing"
  echo "📄 GitHub Pages will be live shortly at: https://saltymother.github.io/men-health-looksmaxxing/"
else
  echo ""
  echo "❌ Push failed. Please verify that:"
  echo "  1. You created the repository at https://github.com/new (named 'men-health-looksmaxxing')"
fi
