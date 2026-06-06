

set -e

if [ "$SEED_ON_BOOT" = "true" ]; then
  if [ "$SEED_RESET" = "true" ]; then
    echo "[entrypoint] SEED_ON_BOOT=true SEED_RESET=true -> running seed --fresh (DESTRUCTIVE)"
    node dist/seeds/seed.js --fresh
  else
    echo "[entrypoint] SEED_ON_BOOT=true -> running seed (idempotent upsert)"
    node dist/seeds/seed.js
  fi
  echo "[entrypoint] seed complete."
else
  echo "[entrypoint] SEED_ON_BOOT not set -> skipping seed."
fi

echo "[entrypoint] starting app: node dist/main"
exec node dist/main
