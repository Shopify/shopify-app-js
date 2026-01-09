-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MySession" (
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
INSERT INTO "new_MySession" ("accessToken", "expires", "id", "isOnline", "scope", "shop", "state", "userId", "firstName", "lastName", "email", "accountOwner", "locale", "collaborator", "emailVerified") SELECT "accessToken", "expires", "id", "isOnline", "scope", "shop", "state", "userId", "firstName", "lastName", "email", "accountOwner", "locale", "collaborator", "emailVerified" FROM "MySession";
DROP TABLE "MySession";
ALTER TABLE "new_MySession" RENAME TO "MySession";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;