# Hydrant - deploy steps

This file, and other contents of this folder, should be mirrored in `/afs/sipb/project/hydrant`. This folder is called our *locker*.

If you're in the `sipb-hydrant` list, you can login to Athena and do `ssh hydrant@scripts`. You'll sign in to the Scripts account, whose home folder `~` is `/afs/sipb/project/hydrant`.

Our repo has a copy at `~/hydrant` with symlinks to other places. In particular:

- `~/README.md` links to `~/hydrant/deploy/README.md`.
- `~/cron_scripts` links to `~/hydrant/deploy/cron_scripts`.
- `~/web_scripts/notify_build.py` links to `~/hydrant/deploy/web_scripts/notify_build.py`.
  - Nothing else in `~/web_scripts` should be in the repo.
- Nothing in `~/ci_secrets` should be in the repo.
  - But read the `~/ci_secrets/README` file!

## Frontend

Everything on `~/web_scripts` is served to the internet under (https://hydrant.scripts.mit.edu/). The service that does this is called [Scripts](https://scripts.mit.edu/). The link (https://hydrant.mit.edu) points to the subfolder `~/web_scripts/hydrant`, which is where the deployed files are.

The server's frontend updates based on the `deploy` branch on GitHub, so any changes pushed there will become live. In particular:

1. GitHub actions CI triggers (https://github.com/sipb/hydrant/actions). This builds the frontend on the GitHub servers, saving the built directory in an 'artifact'. You can find the artifact by hand at https://github.com/sipb/hydrant/actions/runs/RUN_ID_HERE.

2. Once the build is done, CI fires a GitHub webhook (https://github.com/sipb/hydrant/settings/hooks). This one is pointed at (https://hydrant.scripts.mit.edu/report_build.py); hosted at `~/web_scripts/report_build.py` in the locker.

  The webhook does something called a [POST request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST). You can think of it as running the `~/web_scripts/report_build.py` script and giving it input, except we're giving the input through the internet. The input is taken in through `stdin`, and is encoded with JSON.

  You can look at the output of the webhook in the Github hooks settings: (https://github.com/sipb/hydrant/settings/hooks).

3. The script grabs the URL to the 'artifact'* and downloads it. The relevant API docs are on GitHub at (https://docs.github.com/en/rest/actions/artifacts).

4. The script unpacks the files to the production directory `~/web_scripts/hydrant`.

Note that the GitHub token in `ci_secrets` must be regenerated yearly.

## Backend

The backend runs on an XVM instance at `hydrant.xvm.mit.edu`. It is deployed separately from the frontend code.

After the backend is build with `npm run build`, we start the server on the XVM instance with [PM2](https://pm2.keymetrics.io/) using the `pm2.config.js` file located in this folder.

*NB: This documentation is incomplete! It will be updated after the migration to a Node.js backend is finished and we finalize the deployment process.*