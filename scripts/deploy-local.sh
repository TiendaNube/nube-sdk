#!/bin/bash
set -euo pipefail

LIGHTSPEED_DIR="${LIGHTSPEED_DIR:-../ns-ch-lit-k8s-storefront}"

if [ ! -d "$LIGHTSPEED_DIR" ]; then
  echo "ERROR: Lightspeed directory not found at '$LIGHTSPEED_DIR'"
  echo "Set LIGHTSPEED_DIR to the correct path, e.g.:"
  echo "  LIGHTSPEED_DIR=~/projects/ns-ch-lit-k8s-storefront npm run build:local"
  exit 1
fi

LIGHTSPEED_DIR="$(cd "$LIGHTSPEED_DIR" && pwd)"
TYPES_SRC="packages/types/src"
LS_TYPES_DIR="$LIGHTSPEED_DIR/node_modules/@tiendanube/nube-sdk-types/src"

if [ -d "$LS_TYPES_DIR" ]; then
  cp "$TYPES_SRC"/* "$LS_TYPES_DIR/"
  echo ""
  echo "Deployed nube-sdk-types:"
  echo "  types/src/* -> Lightspeed node_modules/…/nube-sdk-types/src/"
else
  echo "WARNING: nube-sdk-types not found in Lightspeed at '$LS_TYPES_DIR'"
  echo "         Run 'pnpm install' in Lightspeed first."
  exit 1
fi
