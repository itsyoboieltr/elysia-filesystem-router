import { Elysia } from 'elysia';
import { edenTreaty } from '@elysiajs/eden';
import { fileSystemRouter } from '../src';

export const app = new Elysia().use(await fileSystemRouter()).listen(3000);

export type App = typeof app;

const eden = edenTreaty<App>('http://localhost:3000');

const response = await eden.hello.test.get();

console.log(response.data);
