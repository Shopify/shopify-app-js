
<div align = center>

# Shopify App JS

*A mono-repo containing a collection of packages*  
*designed to easily integrate apps with Shopify.*

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
