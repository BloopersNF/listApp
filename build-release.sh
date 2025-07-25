#!/bin/bash

echo "🚀 Preparando build de produção para Play Store..."

# Limpar projeto
cd android
./gradlew clean

# Build de produção (AAB)
./gradlew bundleRelease

echo "✅ Build concluído!"
echo "📱 Arquivo gerado em: android/app/build/outputs/bundle/release/app-release.aab"
echo "📤 Faça upload deste arquivo na Play Store"
