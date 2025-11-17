-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN,
    "locale" TEXT,
    "collaborator" BOOLEAN,
    "emailVerified" BOOLEAN,
    "refreshToken" TEXT,
    "refreshTokenExpires" DATETIME
);
INSERT INTO "new_Session" ("id", "shop", "state", "isOnline", "scope", "expires", "accessToken", "userId", "firstName", "lastName", "email", "accountOwner", "locale", "collaborator", "emailVerified") SELECT "id", "shop", "state", "isOnline", "scope", "expires", "accessToken", "userId", "firstName", "lastName", "email", "accountOwner", "locale", "collaborator", "emailVerified" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;