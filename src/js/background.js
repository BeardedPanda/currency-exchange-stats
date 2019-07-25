import '../img/icon-256.png';
import '../img/icon-128.png';
import '../img/icon-64.png';
import '../img/icon-32.png';
import '../img/raised.svg';
import '../img/lowered.svg';
import {updateAllData} from "./data-parser";

updateAllData();

chrome.alarms.create('15minTimer', {periodInMinutes: 15});
chrome.alarms.onAlarm.addListener(updateAllData);
