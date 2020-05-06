import { getItem } from "./storage";

export const resetAlarm = async () => {
	chrome.alarms.clearAll();
	const { updatePeriod } = await getItem("settings");
	chrome.alarms.create("updateTimer", { periodInMinutes: updatePeriod || 15 });
};
