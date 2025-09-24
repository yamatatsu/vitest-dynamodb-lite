#!/bin/bash
set -e

echo "🚀 Starting Dev Container setup..."

echo "👤 Current user:"
whoami

echo "📦 Installing dependencies..."
pnpm install

if [ -f ".devcontainer/setup.personal.sh" ]; then
    bash .devcontainer/setup.personal.sh
fi

echo "✨ Dev Container setup completed successfully!"
