import type { Handle } from '@sveltejs/kit';
import type { HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	return response;
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();

	return {
		message: 'Whoops!',
		errorId
	};
};
