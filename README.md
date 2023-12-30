# elysia-filesystem-router

Filesystem router for [Elysia](https://elysiajs.com/), to help you separate and manage your routes with ease and type safety.

## Install

```bash
bun add elysia-filesystem-router
```

## Usage

### 1. Register the plugin

```ts
// file: src/routes/index.ts
import { Elysia } from 'elysia';
import { fileSystemRouter } from 'elysia-filesystem-router';

new Elysia()
  .use(await fileSystemRouter({ rootDir: 'src/routes' }))
  .listen(3000);
```

### 2. Create your filesystem routes

```ts
// file: src/routes/example/index.ts
// url: http://localhost:3000/example

import { Elysia } from 'elysia';

export const exampleRoute = new Elysia().get('', 'Hello world!');
```

The router is looking for `index.ts` files under the specified root directory `rootDir` to register the routes. Once a file has been found, the router will try to find an exported `Elysia` instance in the file, and register the routes under the prefix of the directory name. Since the directory name is used as the prefix of the Elysia instance, please do NOT manually set the prefix, as it can cause unexpected behavior. The required name of the exported Elysia instance depends on the directory name:

- `rootDir/example/index.ts` -> `exampleRoute`
- `rootDir/user/index.ts` -> `userRoute`
- `rootDir/user/profile/index.ts` -> `userProfileRoute`

## Configuration

### rootDir

`string`

The root directory of the filesystem router.
