import { Elysia } from 'elysia';

export const exampleRoute = new Elysia().get('', { data: 'example' });
