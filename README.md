# `@shopify/shopify-app-js`

This repo is a collection of packages that make it easy for apps to integrate with Shopify.
They all build on top of the [@shopify/shopify-api](https://github.com/Shopify/shopify-api-js) package to cover specific use cases.

This mono-repo supports the following packages:

## App middleware

#### [`@shopify/shopify-app-express`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-express)

Creates a middleware layer that allows [Express.js](https://expressjs.com) apps to communicate with and authenticate requests from Shopify.

<br>
<br>

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
[MongoDB]: https://www.mongodb.com/home
[SQLite]: https://www.sqlite.org
[MySQL]: https://www.mysql.com
[Redis]: https://redis.io


[GitHub CloudFlare]: packages/shopify-app-session-storage-kv
[GitHub PostgreSQL]: packages/shopify-app-session-storage-postgresql
[GitHub MongoDB]: packages/shopify-app-session-storage-mongodb
[GitHub SQLite]: packages/shopify-app-session-storage-sqlite
[GitHub Memory]: packages/shopify-app-session-storage-memory
[GitHub Redis]: packages/shopify-app-session-storage-redis
[GitHub MySQL]: packages/shopify-app-session-storage-mysql
[GitHub OAuth]: packages/shopify-app-session-storage


[NPM PostgreSQL]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-postgresql
[NPM CloudFlare]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-kv
[NPM MongoDB]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mongodb
[NPM Memory]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-memory
[NPM SQLite]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-sqlite
[NPM Redis]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-redis
[NPM MySQL]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mysql
[NPM OAuth]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage
