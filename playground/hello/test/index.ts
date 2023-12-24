import { Elysia } from 'elysia';

export const helloTestRoute = new Elysia().get('', { data: 'test' });
