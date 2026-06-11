-- One-minute cron precision lets sync-matches use its schedule-aware one- and
-- two-minute live intervals. The Edge Function still self-throttles, so skipped
-- invocations do not consume calls from the upstream 500-call daily allowance.
select cron.schedule(
  'sync-matches',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url' limit 1)
           || '/functions/v1/sync-matches',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
