#!/usr/bin/env bash
#
# GoDaddy DNS helper — create/update CNAME records via GoDaddy API.
#
# Usage:
#   source scripts/godaddy-dns.sh
#   godaddy_set_cname "pulse" "aventure-studio.com" "cname.vercel-dns.com"
#
# Requires: GODADDY_API_KEY and GODADDY_API_SECRET env vars.
#

godaddy_set_cname() {
  local name="$1"        # subdomain name (e.g. "pulse")
  local domain="$2"      # base domain (e.g. "aventure-studio.com")
  local target="$3"      # CNAME target (e.g. "cname.vercel-dns.com")
  local ttl="${4:-600}"   # TTL in seconds, default 10 min

  local key="${GODADDY_API_KEY:-}"
  local secret="${GODADDY_API_SECRET:-}"

  if [[ -z "$key" || -z "$secret" ]]; then
    echo "  ⚠  GODADDY_API_KEY / GODADDY_API_SECRET not set — skipping DNS."
    echo "     Add CNAME manually: $name.$domain → $target"
    return 1
  fi

  echo "→ Creating CNAME: $name.$domain → $target"

  local response
  response=$(curl -s -w "\n%{http_code}" -X PUT \
    "https://api.godaddy.com/v1/domains/${domain}/records/CNAME/${name}" \
    -H "Authorization: sso-key ${key}:${secret}" \
    -H "Content-Type: application/json" \
    -d "[{\"data\": \"${target}\", \"ttl\": ${ttl}}]")

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" == "200" ]]; then
    echo "  ✓ DNS record created: $name.$domain → $target"
    return 0
  else
    echo "  ✗ GoDaddy API error (HTTP $http_code): $body"
    return 1
  fi
}
