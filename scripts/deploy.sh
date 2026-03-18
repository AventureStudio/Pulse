#!/usr/bin/env bash
#
# Automated Vercel deployment for Aventure Studio apps.
# Usage: ./scripts/deploy.sh [--prod] [--domain APP.aventure-studio.com]
#
# Prerequisites:
#   npm i -g vercel
#   vercel login          (or set VERCEL_TOKEN env var)
#
# Examples:
#   ./scripts/deploy.sh                           # Preview deploy
#   ./scripts/deploy.sh --prod                    # Production deploy
#   ./scripts/deploy.sh --prod --domain pulse.aventure-studio.com
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load shared .env from workspace root (parent of project)
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
[[ -f "$WORKSPACE_ROOT/.env" ]] && set -a && source "$WORKSPACE_ROOT/.env" && set +a

# Load GoDaddy DNS helper
source "$SCRIPT_DIR/godaddy-dns.sh"

# ── Config ──────────────────────────────────────────────────────────
TEAM="${VERCEL_TEAM:-}"            # --scope flag, leave empty for personal
TOKEN="${VERCEL_TOKEN:-}"          # optional, for CI/headless usage
PROD=false
DOMAIN=""

# ── Parse args ──────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod)   PROD=true; shift ;;
    --domain) DOMAIN="$2"; shift 2 ;;
    --team)   TEAM="$2"; shift 2 ;;
    --token)  TOKEN="$2"; shift 2 ;;
    -h|--help)
      head -14 "$0" | tail -12
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── Helpers ─────────────────────────────────────────────────────────
cmd_base="vercel"
[[ -n "$TOKEN" ]] && cmd_base="$cmd_base --token $TOKEN"
[[ -n "$TEAM"  ]] && cmd_base="$cmd_base --scope $TEAM"

run_vercel() {
  echo "→ $cmd_base $*"
  $cmd_base "$@"
}

# ── Ensure Vercel CLI is available ──────────────────────────────────
if ! command -v vercel &>/dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

# ── Link project if not already linked ──────────────────────────────
if [[ ! -d .vercel ]]; then
  echo "Linking project to Vercel..."
  run_vercel link --yes
fi

# ── Deploy ──────────────────────────────────────────────────────────
if $PROD; then
  echo "Deploying to production..."
  DEPLOY_URL=$(run_vercel --prod --yes 2>&1 | tail -1)
else
  echo "Creating preview deployment..."
  DEPLOY_URL=$(run_vercel --yes 2>&1 | tail -1)
fi

echo ""
echo "Deployed: $DEPLOY_URL"

# ── Assign custom domain ───────────────────────────────────────────
if [[ -n "$DOMAIN" ]]; then
  echo ""
  echo "Adding domain: $DOMAIN"
  run_vercel domains add "$DOMAIN" --yes 2>/dev/null || true

  # Auto-configure DNS via GoDaddy
  SUBDOMAIN="${DOMAIN%%.*}"
  BASE_DOMAIN="${DOMAIN#*.}"
  godaddy_set_cname "$SUBDOMAIN" "$BASE_DOMAIN" "cname.vercel-dns.com"

  echo ""
  echo "Domain $DOMAIN configured."
fi

echo ""
echo "Done."
