
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sync-matches',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://gglthjjbbyrrliuzuidw.supabase.co/functions/v1/sync-matches',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (
        select decrypted_secret
          from vault.decrypted_secrets
         where name = 'service_role_key'
         limit 1
      ),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
;
