import { json } from '@sveltejs/kit';
import { kv } from '$lib/kv';

export async function GET({ params }) {
	try {
		const { stopwatch: stopwatchId } = params;
		const stopwatch = await kv.hgetall(`stopwatch:${stopwatchId}`);

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
	} catch (error) {
		console.error('Error in GET /api/stopwatch/[stopwatch]:', error);
		return json({ error: 'Failed to fetch stopwatch data' }, { status: 500 });
	}
}

export async function POST({ request, params }) {
	try {
		const { stopwatch: stopwatchId } = params;
		const { startTime, elapsedTime, isRunning, laps, previousLapTime, note } = await request.json();
		const timestamp = Date.now();

		// Prepare data for Redis hash storage - convert all fields to strings/serialized format
		const stopwatchData = {
			startTime: startTime.toString(),
			elapsedTime: elapsedTime.toString(),
			isRunning: isRunning.toString(),
			laps: JSON.stringify(laps || []),
			previousLapTime: (previousLapTime || 0).toString(),
			note: note || '',
			lastUpdated: timestamp.toString()
		};

		// Use a transaction to update both the hash and the sorted set
		await Promise.all([
			// Save stopwatch data in a hash
			kv.hset(`stopwatch:${stopwatchId}`, stopwatchData),
			// Update the sorted set with the latest timestamp
			kv.zadd('stopwatches', { score: timestamp, member: stopwatchId })
		]);

		return json({
			id: stopwatchId,
			success: true
		});
	} catch (error) {
		console.error('Error in POST /api/stopwatch/[stopwatch]:', error);
		return json({ error: 'Failed to save stopwatch data' }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	try {
		const { stopwatch: stopwatchId } = params;

		// Use a transaction to remove from both the hash and the sorted set
		await Promise.all([kv.del(`stopwatch:${stopwatchId}`), kv.zrem('stopwatches', stopwatchId)]);

		return json({ message: 'Stopwatch deleted' });
	} catch (error) {
		console.error('Error in DELETE /api/stopwatch/[stopwatch]:', error);
		return json({ error: 'Failed to delete stopwatch data' }, { status: 500 });
	}
}
