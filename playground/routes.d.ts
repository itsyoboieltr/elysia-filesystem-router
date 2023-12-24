import type Elysia from 'elysia';
import { helloRoute } from './hello';
import { helloTestRoute } from './hello/test';
import { exampleRoute } from './example';

declare global {
  type AddPrefixToRoutes<Routes, Prefix extends string> = {
    [K in keyof Routes as `${Prefix}${K & string}`]: Routes[K];
  };

  type RemapElysiaWithPrefix<
    ElysiaType,
    Prefix extends string
  > = ElysiaType extends Elysia<
    infer BasePath,
    infer Decorators,
    infer Definitions,
    infer ParentSchema,
    infer Macro,
    infer Routes,
    infer Scoped
  >
    ? Elysia<
        BasePath,
        Decorators,
        Definitions,
        ParentSchema,
        Macro,
        AddPrefixToRoutes<Routes, Prefix>,
        Scoped
      >
    : never;

  type ElysiaFileSystemRouter = RemapElysiaWithPrefix<typeof helloRoute, '/hello'> & RemapElysiaWithPrefix<typeof helloTestRoute, '/hello/test'> & RemapElysiaWithPrefix<typeof exampleRoute, '/example'>;
}
