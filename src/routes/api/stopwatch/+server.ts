import { json } from '@sveltejs/kit';
import { kv } from '$lib/kv';

export async function GET({ request, url }) {
	const id = url.searchParams.get('id');

	try {
		if (id) {
			// Get a specific stopwatch by ID
			const stopwatch = await kv.hgetall(`stopwatch:${id}`);

			// Parse string fields if they exist
			if (stopwatch) {
				// Parse numeric fields
				if (typeof stopwatch.startTime === 'string')
					stopwatch.startTime = parseInt(stopwatch.startTime);
				if (typeof stopwatch.elapsedTime === 'string')
					stopwatch.elapsedTime = parseInt(stopwatch.elapsedTime);
				if (typeof stopwatch.previousLapTime === 'string')
					stopwatch.previousLapTime = parseInt(stopwatch.previousLapTime);
				if (typeof stopwatch.createdAt === 'string')
					stopwatch.createdAt = parseInt(stopwatch.createdAt);

				// Parse laps JSON
				if (typeof stopwatch.laps === 'string') {
					try {
						stopwatch.laps = JSON.parse(stopwatch.laps);
					} catch (e) {
						stopwatch.laps = [];
					}
				}

				// Convert string boolean to actual boolean
				if (typeof stopwatch.isRunning === 'string') {
					stopwatch.isRunning = stopwatch.isRunning === 'true';
				}
			}

			return json(stopwatch || null);
		} else {
			// Get the last 100 stopwatch records using a sorted set
			const stopwatchIds = await kv.zrange('stopwatches', 0, 99, { rev: true });
			const stopwatches = [];

			// Fetch each stopwatch data
			for (const id of stopwatchIds) {
				const stopwatch = await kv.hgetall(`stopwatch:${id}`);

				if (stopwatch) {
					// Parse numeric fields
					if (typeof stopwatch.startTime === 'string')
						stopwatch.startTime = parseInt(stopwatch.startTime);
					if (typeof stopwatch.elapsedTime === 'string')
						stopwatch.elapsedTime = parseInt(stopwatch.elapsedTime);
					if (typeof stopwatch.previousLapTime === 'string')
						stopwatch.previousLapTime = parseInt(stopwatch.previousLapTime);
					if (typeof stopwatch.createdAt === 'string')
						stopwatch.createdAt = parseInt(stopwatch.createdAt);

					// Parse laps JSON
					if (typeof stopwatch.laps === 'string') {
						try {
							stopwatch.laps = JSON.parse(stopwatch.laps);
						} catch (e) {
							stopwatch.laps = [];
						}
					}

					// Convert string boolean to actual boolean
					if (typeof stopwatch.isRunning === 'string') {
						stopwatch.isRunning = stopwatch.isRunning === 'true';
					}

					stopwatches.push({
						id,
						...stopwatch
					});
				}
			}

			return json(stopwatches);
		}
	} catch (error) {
		console.error('Error in GET /api/stopwatch:', error);
		return json({ error: 'Failed to fetch stopwatch data' }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const data = await request.json();
		const id = data.id || crypto.randomUUID(); // Generate a UUID if no ID provided
		const timestamp = Date.now();

		// Prepare data for Redis hash storage - convert all fields to strings/serialized format
		const stopwatchData = {
			startTime: data.startTime.toString(),
			elapsedTime: data.elapsedTime.toString(),
			isRunning: data.isRunning.toString(),
			laps: JSON.stringify(data.laps || []),
			previousLapTime: (data.previousLapTime || 0).toString(),
			note: data.note || '',
			createdAt: timestamp.toString()
		};

		// Use a transaction to update both the hash and the sorted set
		await Promise.all([
			// Save stopwatch data in a hash
			kv.hset(`stopwatch:${id}`, stopwatchData),
			// Add to the sorted set with timestamp as score for time-based sorting
			kv.zadd('stopwatches', { score: timestamp, member: id })
		]);

		return json({
			id,
			...data,
			createdAt: timestamp
		});
	} catch (error) {
		console.error('Error in POST /api/stopwatch:', error);
		return json({ error: 'Failed to save stopwatch data' }, { status: 500 });
	}
}

export async function DELETE({ request }) {
	try {
		const { id } = await request.json();

		// Use a transaction to remove from both the hash and the sorted set
		await Promise.all([kv.del(`stopwatch:${id}`), kv.zrem('stopwatches', id)]);

		return json({ message: 'Stopwatch deleted' });
	} catch (error) {
		console.error('Error in DELETE /api/stopwatch:', error);
		return json({ error: 'Failed to delete stopwatch data' }, { status: 500 });
	}
}
