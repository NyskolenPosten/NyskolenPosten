#!/bin/bash

API_URL="http://localhost:54321/rest/v1/"
RESP=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

echo ""
echo "=============================="
echo "  SJEKKER SUPABASE API-STATUS "
echo "=============================="

if [ "$RESP" = "200" ] || [ "$RESP" = "401" ] || [ "$RESP" = "404" ]; then
  echo "✅ API-et svarer! (HTTP-kode: $RESP)"
else
  echo "❌ API-et svarer IKKE! (HTTP-kode: $RESP)"
  echo "Tips:"
  echo "- Sjekk at Supabase-serveren kjører: npx supabase start"
  echo "- Sjekk at du bruker riktig URL og port: $API_URL"
  echo "- Sjekk brannmur/port-innstillinger"
fi

echo ""
