
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
cases while building on top of **[@shopify/shopify-api][GitHub API]**

<br>
<br>

## App Middleware

<br>

-   ### **[Remix]**

    Middlware for Remix apps that allows to communicate  
    with and authenticate requests coming from Shopify.
    
    ```
    @shopify/shopify-app-remix
    ```
    
    [<kbd> GitHub </kbd>][GitHub Remix]  
    [<kbd> NPM </kbd>][NPM Remix]

    <br>

-   ### **[Express.js]**

    Middlware for Express apps that allows to communicate  
    with and authenticate requests coming from Shopify.

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

-   ### **Memory**

    Simplified memory-based implementation.

    ```
    @shopify/shopify-app-session-storage-memory
    ```
    
    [<kbd> GitHub </kbd>][GitHub Memory]  
    [<kbd> NPM </kbd>][NPM Memory]

    <br>
    
-   ### **[Prisma]**

    ```
    @shopify/shopify-app-session-storage-prisma
    ```

    [<kbd> GitHub </kbd>][GitHub Prisma]  
    [<kbd> NPM </kbd>][NPM Prisma]
    
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
<br>

## Session Storage Adaptor

Provides an interface that enables apps to store the sessions  
created during the OAuth process in  `@shopify/shopify-api`

You can assign any implementation of this interface to the  
`@shopify/shopify-app-express`  package, but you can also call  
them directly from your app if you're not building with **[Express.js]**

```
@shopify/shopify-app-session-storage
```

[<kbd> GitHub </kbd>][GitHub OAuth]  
[<kbd> NPM </kbd>][NPM OAuth]

<br>
<br>

## Community Packages

*Contributed `SessionStorage` implementations.*

<br>

-   ### **[AWS DynamoDB]**

    Contributed by **[Chris]** - thank you :clap:

    ```
    @shopify/shopify-app-session-storage-dynamodb
    ```
    
    [<kbd> GitHub </kbd>][GitHub DynamoDB]  
    [<kbd> NPM </kbd>][NPM DynamoDB] 

<br>


<!----------------------------------------------------------------------------->

[CloudFlare KV Storage]: https://www.cloudflare.com/products/workers-kv
[AWS DynamoDB]: https://aws.amazon.com/dynamodb/
[PostgreSQL]: https://www.postgresql.org
[Express.js]: https://expressjs.com
[MongoDB]: https://www.mongodb.com/home
[Prisma]: https://www.prisma.io/
[SQLite]: https://www.sqlite.org
[Chris]: https://github.com/zirkelc
[MySQL]: https://www.mysql.com
[Remix]: https://remix.run
[Redis]: https://redis.io


[GitHub CloudFlare]: packages/shopify-app-session-storage-kv
[GitHub PostgreSQL]: packages/shopify-app-session-storage-postgresql
[GitHub DynamoDB]: packages/shopify-app-session-storage-dynamodb
[GitHub MongoDB]: packages/shopify-app-session-storage-mongodb
[GitHub Express]: packages/shopify-app-express
[GitHub SQLite]: packages/shopify-app-session-storage-sqlite
[GitHub Memory]: packages/shopify-app-session-storage-memory
[GitHub Prisma]: packages/shopify-app-session-storage-prisma
[GitHub Redis]: packages/shopify-app-session-storage-redis
[GitHub MySQL]: packages/shopify-app-session-storage-mysql
[GitHub OAuth]: packages/shopify-app-session-storage
[GitHub Remix]: packages/shopify-app-remix
[GitHub API]: https://github.com/Shopify/shopify-api-js


[NPM PostgreSQL]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-postgresql
[NPM CloudFlare]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-kv
[NPM DynamoDB]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-dynamodb
[NPM MongoDB]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mongodb
[NPM Express]: https://www.npmjs.com/package/@shopify/shopify-app-express
[NPM Memory]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-memory
[NPM SQLite]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-sqlite
[NPM Prisma]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-prisma
[NPM Redis]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-redis
[NPM MySQL]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mysql
[NPM OAuth]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage
[NPM Remix]: https://www.npmjs.com/package/@shopify/shopify-app-remix
