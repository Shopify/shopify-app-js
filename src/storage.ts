import {SQLiteSessionStorage} from '../session-storage/sqlite';

const DB_PATH = `${process.cwd()}/database.sqlite`;

export const storage = new SQLiteSessionStorage(DB_PATH);
