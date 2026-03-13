import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runBackup } from '$lib/server/backup';

export const POST: RequestHandler = async () => {
	try {
		const path = await runBackup();
		return json({ ok: true, path });
	} catch (err) {
		console.error('[api/backup]', err);
		return json({ error: 'Backup failed' }, { status: 500 });
	}
};
