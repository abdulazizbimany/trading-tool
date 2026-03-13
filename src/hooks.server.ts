import type { Handle } from '@sveltejs/kit';
import { autoSeedIfEmpty } from '$lib/server/seed';
import { initCronJobs } from '$lib/server/cron';

let serverInit = false;

async function initServer() {
	if (serverInit) return;
	serverInit = true;

	await autoSeedIfEmpty();
	initCronJobs();
}

export const handle: Handle = async ({ event, resolve }) => {
	await initServer();
	return resolve(event);
};
