import dayjs from "dayjs";

export function categorizeTimeSlots(slots: Date[]) {
	const grouped: { morning: string[]; afternoon: string[]; evening: string[] } =
		{ morning: [], afternoon: [], evening: [] };
	for (const slot of slots) {
		const hour = dayjs(slot).hour();
		const label = dayjs(slot).format("hh:mm a");
		if (hour < 12) grouped.morning.push(label);
		else if (hour < 17) grouped.afternoon.push(label);
		else grouped.evening.push(label);
	}
	return grouped;
}
