
-- Re-schedule (cron.schedule with same name upserts the entry)
select cron.schedule(
  'sync-matches',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url' limit 1)
           || '/functions/v1/sync-matches',
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'X-Cron-Secret',  (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
;
