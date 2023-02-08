# Implementing session storage

A custom implementaton of `SessionStorage` will need to implement the following methods, as documented by the abstract [`SessionStorage`](./src/types.ts) class:

|        Method        | Parameter type |          Return value           | Description                                                                                                   |
| :------------------: | :------------: | :-----------------------------: | ------------------------------------------------------------------------------------------------------------- |
|    `storeSession`    |   `Session`    |       `Promise<boolean>`        | Creates or updates the given session in storage; returns `true` if successfully stored, `false` otherwise     |
|    `loadSession`     |    `string`    | `Promise<Session \| undefined>` | Returns a `Session` matching the given session id from storage, or returns `undefined` if not found           |
|   `deleteSession`    |    `string`    |       `Promise<boolean>`        | Deletes a session matching the given session id from storage; returns `true` if successful, `false` otherwise |
|   `deleteSessions`   |   `string[]`   |       `Promise<boolean>`        | Deletes each of the given session ids (array) from storage; returns `true` if successful, `false` otherwise   |
| `findSessionsByShop` |    `string`    |      `Promise<Session[]>`       | Returns an array of `Session`s for the given shop domain; returns an empty array of none found                |

## Example

As an example of an implementation, the following saves sessions to a text file, stored in CSV format.

> **Note 1**: This is for the purposes of example only - this implementation would not be suitable for production as it would be too inefficient nor would it scale beyond a single app instance.

> **Note 2**: The format of a line in the csv file is a list of property name/property value pairs, e.g.

```csv
id,this-is-a-session-id,shop,my-test-shop.myshopify.com,state,150801840581085,isOnline,true,...
```

```ts
import fs from 'fs';
import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

export class CsvSessionStorage extends SessionStorage {
  constructor(private filename: string) {
    super();

    this.init();
  }

  public async storeSession(session: Session): Promise<boolean> {
    try {
      const lines = this.readLines();

      let found = false;

      // process each line
      for (let i = 0; i < lines.length; i++) {
        // split the line by comma into columns
        const columns = lines[i].split(',');
        // check if the id column matches (second column is value of 'id')
        if (columns[1] === session.id) {
          // if the session id already exists, update the line
          lines[i] = session.toPropertyArray().join(',');
          found = true;
          break;
        }
      }

      if (!found) {
        // if the session id does not exist, add a new line
        lines.push(session.toPropertyArray().join(','));
      }

      try {
        this.writeLines(lines);
        return true;
      } catch (err) {
        // error on write
        return false;
      }
    } catch (err) {
      // error on read
      return false;
    }
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    try {
      const lines = this.readLines();

      // process each line
      for (const line of lines) {
        // split the line by comma into columns
        const columns = line.split(',');
        // check if the id column matches (second column is value of 'id')
        if (columns[1] === id) {
          // if the session id already exists, convert to session and return
          return Session.fromPropertyArray(
            this.columnsToPropertyArray(columns),
          );
        }
      }

      return undefined;
    } catch (err) {
      // error on read
      return undefined;
    }
  }

  public async deleteSession(id: string): Promise<boolean> {
    try {
      const lines = this.readLines();

      // process each line
      for (let i = 0; i < lines.length; i++) {
        // split the line by comma into columns
        const columns = lines[i].split(',');
        // check if the id column matches (second column is value of 'id')
        if (columns[1] === id) {
          // if the session id matches, remove the line
          lines.splice(i, 1);
          break;
        }
      }

      try {
        this.writeLines(lines);
        return true;
      } catch (err) {
        // error on write
        return false;
      }
    } catch (err) {
      // error on read
      return false;
    }
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      const lines = this.readLines();

      // process each line
      for (let i = 0; i < lines.length; i++) {
        // split the line by comma into columns
        const columns = lines[i].split(',');
        // check if the id column matches (second column is value of 'id')
        if (ids.includes(columns[1])) {
          // if the session id already exists, remove the line
          lines.splice(i, 1);
        }
      }

      try {
        this.writeLines(lines);
        return true;
      } catch (err) {
        // error on write
        return false;
      }
    } catch (err) {
      // error on read
      return false;
    }
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const lines = this.readLines();

      const sessions: Session[] = [];

      // process each line
      for (const line of lines) {
        // split the line by comma into columns
        const columns = line.split(',');
        // check if the shop column matches (fourth column is value of 'shop')
        if (columns[3] === shop) {
          // if the shop matches, convert to session and add to array
          sessions.push(
            Session.fromPropertyArray(this.columnsToPropertyArray(columns)),
          );
        }
      }

      return sessions;
    } catch (err) {
      // error on read
      return [];
    }
  }

  private init() {
    if (!fs.existsSync(this.filename)) {
      fs.writeFileSync(this.filename, '');
    }
  }

  private readLines(): string[] {
    // read contents of the file
    const data = fs.readFileSync(this.filename, {
      encoding: 'utf8',
      flag: 'r',
    });

    // split the contents by new line
    return data.split(/\r?\n/);
  }

  private writeLines(lines: string[]) {
    // write the lines back to the file
    fs.writeFileSync(this.filename, lines.join('\n'), {
      encoding: 'utf8',
      flag: 'w',
    });
  }

  private columnsToPropertyArray(columns: string[]): [string, string][] {
    const propertyArray: [string, string][] = [];
    for (let i = 0; i < columns.length; i += 2) {
      propertyArray.push([columns[i], columns[i + 1]]);
    }
    return propertyArray;
  }
}
```
