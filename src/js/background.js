import { updateAllData } from "./data-parser";
import { setItem, onChange } from "../helpers/storage";
import { supportedCurrencies } from "../helpers/constants";
import { resetAlarm } from "../helpers/alarms";

const init = async () => {
	// silently update data on extension start
	await updateAllData(true);
	await resetAlarm();
};

onChange(async event => {
	if (event.hasOwnProperty("settings") && event.settings.oldValue && event.settings.newValue.updatePeriod !== event.settings.oldValue.updatePeriod) {
		await resetAlarm();
	}
});

const setDefaultSettings = async () => {
	await setItem("settings", {
		showCurrencies: supportedCurrencies,
		trackedCurrencies: [],
		updatePeriod: 15,
		language: "uk",
	});
};

chrome.runtime.onInstalled.addListener(async details => {
	if (details.reason === "install") {
		await setDefaultSettings();
	} else if (details.reason === "update") {
		const thisVersion = chrome.runtime.getManifest().version;
		console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
	}
});

chrome.alarms.onAlarm.addListener(updateAllData);
init();
