-- No-op that ensures future runs don't try to re-apply normalization if it's already done
BEGIN;
-- deliberately empty / idempotent
COMMIT;
