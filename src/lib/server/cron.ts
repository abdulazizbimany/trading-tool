import cron from 'node-cron';
import { runBackup, generateWeeklyReport } from './backup';

let initialized = false;

export function initCronJobs() {
	if (initialized) return;
	initialized = true;

	// Daily backup at 02:00
	cron.schedule('0 2 * * *', async () => {
		try {
			console.log('[cron] Running daily backup...');
			await runBackup();
		} catch (err) {
			console.error('[cron] Backup failed:', err);
		}
	});

	// Weekly report every Monday at 09:00
	cron.schedule('0 9 * * 1', async () => {
		try {
			console.log('[cron] Generating weekly report...');
			await generateWeeklyReport();
		} catch (err) {
			console.error('[cron] Weekly report failed:', err);
		}
	});

	console.log('[cron] Scheduled jobs initialized');
}
