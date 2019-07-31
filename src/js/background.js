import '../img/icon-256.png';
import '../img/icon-128.png';
import '../img/icon-64.png';
import '../img/icon-32.png';
import '../img/raised.svg';
import '../img/lowered.svg';
import {updateAllData} from "./data-parser";
import {onChange, setItem} from "../helpers";
import {supportedCurrencies} from "../helpers/constants";

updateAllData();

onChange((...args) => {
    console.info(...args)
});
const setDefaultSettings = async () => {
    await setItem('settings', {
        showCurrencies: supportedCurrencies,
        trackCurrencies: [],
    });
};
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("This is a first install!");
        setDefaultSettings();
    } else if (details.reason === "update") {
        const thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});

chrome.alarms.create('15minTimer', {periodInMinutes: 15});
chrome.alarms.onAlarm.addListener(updateAllData);
