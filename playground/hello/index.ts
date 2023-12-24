import { Elysia } from 'elysia';

export const helloRoute = new Elysia().get('', { data: 'hello' });
