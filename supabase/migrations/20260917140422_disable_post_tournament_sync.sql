-- The tournament has ended. Keep its results online without polling the source API.
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'sync-matches'),
  active := false
);
