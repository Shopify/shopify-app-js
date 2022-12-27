
<div align = center>

# Shopify App JS

*A mono-repo containing a collection of packages*  
*designed to easily integrate apps with Shopify.*

#### [`@shopify/shopify-app-remix`](./packages/shopify-app-remix)

- Provides functions to allow [Remix](https://remix.run) apps to communicate and authenticate requests from Shopify.

#### [`@shopify/shopify-app-express`](./packages/shopify-app-express)

- Creates a middleware layer that allows [Express.js](https://expressjs.com) apps to communicate with and authenticate requests from Shopify.
<br>

```
@shopify/shopify-app-js
```

</div>

<br>
<br>

## Design

This package has been designed to cover specialized use  
cases while building on top of **[@shopify/shopify-api][GitHub API]**.

<br>
<br>

## App Middleware

<br>

-   ### **[Express.js]**

    Creates a middleware layer that allows express apps to  
    communicate with and authenticate requests from Shopify.

    ```
    @shopify/shopify-app-express
    ```
    
    [<kbd> GitHub </kbd>][GitHub Express]  
    [<kbd> NPM </kbd>][NPM Express]

<br>
<br>

#### [`@shopify/shopify-app-session-storage-prisma`](./packages/shopify-app-session-storage-prisma)

- Provides an implementation of `SessionStorage` that uses [Prisma](https://www.prisma.io/).

#### [`@shopify/shopify-app-session-storage-memory`](./packages/shopify-app-session-storage-memory)

- Provides a simplified memory-based implementation of `SessionStorage` for development.

#### [`@shopify/shopify-app-session-storage-sqlite`](./packages/shopify-app-session-storage-sqlite)

- Provides an implementation of `SessionStorage` that uses [SQLite](https://www.sqlite.org).

#### [`@shopify/shopify-app-session-storage-mongodb`](./packages/shopify-app-session-storage-mongodb)

- Provides an implementation of `SessionStorage` that uses [MongoDB](https://www.mongodb.com/home).

#### [`@shopify/shopify-app-session-storage-mysql`](./packages/shopify-app-session-storage-mysql)

- Provides an implementation of `SessionStorage` that uses [MySQL](https://www.mysql.com).

#### [`@shopify/shopify-app-session-storage-postgresql`](./packages/shopify-app-session-storage-postgresql)

- Provides an implementation of `SessionStorage` that uses [PostgreSQL](https://www.postgresql.org).

#### [`@shopify/shopify-app-session-storage-redis`](./packages/shopify-app-session-storage-redis)

- Provides an implementation of `SessionStorage` that uses [Redis](https://redis.io).

#### [`@shopify/shopify-app-session-storage-kv`](./packages/shopify-app-session-storage-kv)

- Provides an implementation of `SessionStorage` that uses [CloudFlare KV storage](https://www.cloudflare.com/products/workers-kv).

### Building a Session Storage Adaptor

#### [`@shopify/shopify-app-session-storage`](./packages/shopify-app-session-storage)

- Provides an interface that enables apps to store the sessions created during the OAuth process in `@shopify/shopify-api`.

- You can assign any implementation of this interface to the [Middleware layer](#app-middleware) packages. You can also call them directly from your app even if you're not building with [Express.js](https://expressjs.com).

### Community contributed implementations of `SessionStorage`

#### [`@shopify/shopify-app-session-storage-dynamodb`](./packages/shopify-app-session-storage-dynamodb)

- Provides an implementation of `SessionStorage` that uses [AWS DynamoDB](https://aws.amazon.com/dynamodb/). Contributed by [Chris](https://github.com/zirkelc) - thank you :clap:
## Session Storage Options

*Implementations for different vendors / technologies.*

<br>

-   ### **OAuth**

    Provides an interface that enables apps to store the sessions  
    created during the OAuth process in  `@shopify/shopify-api`

    You can assign any implementation of this interface to the  
    `@shopify/shopify-app-express`  package, but you can also call  
    them directly from your app if you're not building with Express.js.

    ```
    @shopify/shopify-app-session-storage
    ```
    
    [<kbd> GitHub </kbd>][GitHub OAuth]  
    [<kbd> NPM </kbd>][NPM OAuth]

    <br>

-   ### **Memory**

    Simplified memory-based implementation.

    ```
    @shopify/shopify-app-session-storage-memory
    ```
    
    [<kbd> GitHub </kbd>][GitHub Memory]  
    [<kbd> NPM </kbd>][NPM Memory]

    <br>

-   ### **[SQLite]**

    ```
    @shopify/shopify-app-session-storage-sqlite
    ```
    
    [<kbd> GitHub </kbd>][GitHub SQLite]  
    [<kbd> NPM </kbd>][NPM SQLite]

    <br>

-   ### **[MongoDB]**

    ```
    @shopify/shopify-app-session-storage-mongodb
    ```
    
    [<kbd> GitHub </kbd>][GitHub MongoDB]  
    [<kbd> NPM </kbd>][NPM MongoDB]

    <br>

-   ### **[MySQL]**

    ```
    @shopify/shopify-app-session-storage-mysql
    ```
    
    [<kbd> GitHub </kbd>][GitHub MySQL]  
    [<kbd> NPM </kbd>][NPM MySQL]

    <br>
    
-   ### **[PostgreSQL]**

    ```
    @shopify/shopify-app-session-storage-postgresql
    ```
    
    [<kbd> GitHub </kbd>][GitHub PostgreSQL]  
    [<kbd> NPM </kbd>][NPM PostgreSQL]

    <br>

-   ### **[Redis]**

    ```
    @shopify/shopify-app-session-storage-redis
    ```
    
    [<kbd> GitHub </kbd>][GitHub Redis]  
    [<kbd> NPM </kbd>][NPM Redis]

    <br>

-   ### **[CloudFlare KV Storage]**

    ```
    @shopify/shopify-app-session-storage-kv
    ```
    
    [<kbd> GitHub </kbd>][GitHub CloudFlare]  
    [<kbd> NPM </kbd>][NPM CloudFlare]

<br>


<!----------------------------------------------------------------------------->

[CloudFlare KV Storage]: https://www.cloudflare.com/products/workers-kv
[PostgreSQL]: https://www.postgresql.org
[Express.js]: https://expressjs.com
[MongoDB]: https://www.mongodb.com/home
[SQLite]: https://www.sqlite.org
[MySQL]: https://www.mysql.com
[Redis]: https://redis.io


[GitHub CloudFlare]: packages/shopify-app-session-storage-kv
[GitHub PostgreSQL]: packages/shopify-app-session-storage-postgresql
[GitHub MongoDB]: packages/shopify-app-session-storage-mongodb
[GitHub Express]: packages/shopify-app-express
[GitHub SQLite]: packages/shopify-app-session-storage-sqlite
[GitHub Memory]: packages/shopify-app-session-storage-memory
[GitHub Redis]: packages/shopify-app-session-storage-redis
[GitHub MySQL]: packages/shopify-app-session-storage-mysql
[GitHub OAuth]: packages/shopify-app-session-storage
[GitHub API]: https://github.com/Shopify/shopify-api-js


[NPM PostgreSQL]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-postgresql
[NPM CloudFlare]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-kv
[NPM MongoDB]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mongodb
[NPM Express]: https://www.npmjs.com/package/@shopify/shopify-app-express
[NPM Memory]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-memory
[NPM SQLite]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-sqlite
[NPM Redis]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-redis
[NPM MySQL]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mysql
[NPM OAuth]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage
