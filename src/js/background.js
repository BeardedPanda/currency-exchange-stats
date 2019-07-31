import {updateAllData} from "./data-parser";
import {setItem} from "../helpers/storage";
import {supportedCurrencies} from "../helpers/constants";

// silently update data on extension start
updateAllData(true);

const setDefaultSettings = async () => {
    await setItem('settings', {
        showCurrencies: supportedCurrencies,
        trackedCurrencies: [],
    });
};
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
        await setDefaultSettings();
    } else if (details.reason === "update") {
        const thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});

chrome.alarms.create('15minTimer', {periodInMinutes: 15});
chrome.alarms.onAlarm.addListener(updateAllData);
