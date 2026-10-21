#!/bin/bash

# TalentOS Installation Script
# This script sets up the complete TalentOS HR system on your server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  TalentOS ინსტალატორი                     ║"
echo "║              HR მართვის სისტემა v1.0                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker არ არის დაინსტალირებული!${NC}"
    echo "გთხოვთ დააინსტალირეთ Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose არ არის დაინსტალირებული!${NC}"
    echo "გთხოვთ დააინსტალირეთ Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker და Docker Compose დაინსტალირებულია${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}კონფიგურაციის ფაილი არ არსებობს. ვქმნით...${NC}"
    
    # Generate random passwords and secrets
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
    JWT_SECRET=$(openssl rand -base64 64 | tr -dc 'a-zA-Z0-9' | head -c 64)
    
    # Generate Supabase keys (simplified version - in production use proper key generation)
    ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.$(echo -n "anon-$JWT_SECRET" | sha256sum | head -c 43)"
    SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.$(echo -n "service-$JWT_SECRET" | sha256sum | head -c 43)"
    
    cat > .env << EOF
# Database Configuration
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET

# Supabase Keys
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# URLs
API_EXTERNAL_URL=http://localhost:8000
SITE_URL=http://localhost:3000
SUPABASE_URL=http://localhost:8000

# Optional: SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Optional: Email Configuration (Resend)
RESEND_API_KEY=

# Optional: Lovable AI
LOVABLE_API_KEY=
EOF
    
    echo -e "${GREEN}✓ კონფიგურაციის ფაილი შეიქმნა: .env${NC}"
    echo -e "${YELLOW}! გთხოვთ შეამოწმოთ და საჭიროების შემთხვევაში შეცვალოთ პარამეტრები${NC}"
fi

# Create necessary directories
echo -e "${BLUE}ვქმნით საჭირო დირექტორიებს...${NC}"
mkdir -p docker

echo -e "${BLUE}ვამოწმებთ Docker სერვისებს...${NC}"

# Pull images
echo -e "${BLUE}ვწერთ Docker იმიჯებს...${NC}"
docker-compose pull

# Build the application
echo -e "${BLUE}ვაშენებთ აპლიკაციას...${NC}"
docker-compose build

# Start services
echo -e "${BLUE}ვუშვებთ სერვისებს...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${BLUE}ველოდებით სერვისების მზადყოფნას...${NC}"
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              ინსტალაცია წარმატებით დასრულდა!             ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    echo "║                                                            ║"
    echo "║  აპლიკაცია:    http://localhost:3000                      ║"
    echo "║  API:          http://localhost:8000                       ║"
    echo "║  მონაცემთა ბაზა: localhost:5432                            ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${YELLOW}სასარგებლო ბრძანებები:${NC}"
    echo "  docker-compose logs -f    - ლოგების ნახვა"
    echo "  docker-compose stop       - სერვისების გაჩერება"
    echo "  docker-compose start      - სერვისების გაშვება"
    echo "  docker-compose down       - სერვისების წაშლა"
    echo ""
    echo -e "${BLUE}პირველი ადმინისტრატორის შესაქმნელად გადადით: http://localhost:3000/auth${NC}"
else
    echo -e "${RED}შეცდომა: ზოგიერთი სერვისი არ გაეშვა${NC}"
    echo "გაუშვით 'docker-compose logs' დეტალებისთვის"
    exit 1
fi
