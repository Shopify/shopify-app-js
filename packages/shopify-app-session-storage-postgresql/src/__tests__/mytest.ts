import * as child_process from 'child_process';
import {promisify} from 'util';

import pg from 'pg';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}
async function poll(
  func: () => Promise<boolean>,
  {interval = 100, timeout = 5000} = {},
) {
  const start = Date.now();
  while (true) {
    const elapsed = Date.now() - start;
    if (elapsed > timeout) {
      throw Error('Timeout');
    }

    try {
      const success = await func();
      if (success) return;
    } catch {
      /* lol empty */
    }
    await wait(interval);
  }
}

(async () => {
  const exec = promisify(child_process.exec);

  const dbURL = new URL(
    'postgres://shopify:passify@localhost:5433/migrationtest',
  );
  const sessionTableName = 'ShopifySessions';

  const runCommand = await exec(
    'podman run -d -e POSTGRES_DB=migrationtest -e POSTGRES_USER=shopify -e POSTGRES_PASSWORD=passify -p 5433:5433 postgres:14',
    {encoding: 'utf8'},
  );

  const containerId = runCommand.stdout.trim();
  console.log(`Container ID: ${containerId}`);

  await poll(
    async () => {
      const query = `
        CREATE TABLE ${sessionTableName} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline boolean NOT NULL,
          scope varchar(255),
          expires integer,
          onlineAccessInfo varchar(255),
          accessToken varchar(255)
        )
      `;

      try {
        const client = new pg.Client({connectionString: dbURL.toString()});

        client
          .connect()
          .then(() => console.log('Connected'))
          .catch((_error) => {
            return false;
          });

        client
          .query(query)
          .then(() => {
            console.log('Table created');
            client.end();
          })
          .catch((_error) => {
            return false;
          });
        // await new Promise<void>((resolve, reject) => {
        //   client.connect((err) => {
        //     if (err) {
        //       console.error('connection error', err.stack);
        //       reject(err);
        //     }
        //     // Setup database with lowercase tablename and column names
        //     client.query(query, (err, res) => {
        //       if (err) reject(err);
        //       console.log(res);
        //       resolve();
        //     });
        //   });
        // });
        // await client.end();
      } catch (error) {
        // console.error(`Error caught: ${error.stack}`);
        return false;
      }
      return true;
    },
    {interval: 1000, timeout: 10000},
  );

  await exec(`podman rm -f ${containerId}`);
})();
