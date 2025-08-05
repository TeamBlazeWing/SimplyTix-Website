#!/bin/bash

# Define variables
IMAGE_NAME="surajahasarinda/backend-backend"
TAG="latest"

echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME:$TAG .

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Exiting..."
  exit 1
fi

echo "🔐 Logging into Docker Hub (skip if already logged in)..."
docker login

echo "📤 Pushing image to Docker Hub..."
docker push $IMAGE_NAME:$TAG

if [ $? -eq 0 ]; then
  echo "✅ Image pushed successfully!"
else
  echo "❌ Failed to push the image."
  exit 1
fi
