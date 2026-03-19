INSERT INTO deployments (id, project_id, repo, branch, env_vars, url, status, expires_at)
VALUES
  ('demo-build-1', 'demo-project-1', 'vercel/next.js', 'main', '{"API_KEY":"set-me"}', 'demo.vercel.app', 'READY', NOW() + INTERVAL '6 days'),
  ('demo-build-2', 'demo-project-2', 'deploydotcom/example', 'preview', '{"TOKEN":"abc"}', NULL, 'BUILDING', NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;
