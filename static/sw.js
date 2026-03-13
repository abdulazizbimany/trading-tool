// Trading Blueprint Service Worker — Study Reminders
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Listen for scheduled notification requests
self.addEventListener('message', (event) => {
	if (event.data?.type === 'SCHEDULE_REMINDER') {
		const { time } = event.data; // "HH:MM"
		scheduleDaily(time);
	}
});

let reminderTimer = null;

function scheduleDaily(timeStr) {
	if (reminderTimer) clearTimeout(reminderTimer);

	const [hours, minutes] = timeStr.split(':').map(Number);
	const now = new Date();
	const next = new Date(now);
	next.setHours(hours, minutes, 0, 0);

	if (next <= now) next.setDate(next.getDate() + 1);

	const delay = next.getTime() - now.getTime();

	reminderTimer = setTimeout(() => {
		self.registration.showNotification('Time to Study! 📈', {
			body: "Don't break your streak — open Trading Blueprint and study a lesson!",
			icon: '/favicon.png',
			badge: '/favicon.png',
			tag: 'study-reminder',
			renotify: true,
			actions: [{ action: 'open', title: 'Open App' }]
		});
		scheduleDaily(timeStr); // Reschedule for next day
	}, delay);
}

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	if (event.action === 'open' || !event.action) {
		event.waitUntil(self.clients.openWindow('/'));
	}
});
