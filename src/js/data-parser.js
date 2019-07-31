import {getItem, lionCurrency, setItem} from "../helpers";
import {bankTitles, bankUrls} from "../helpers/constants";

const getComparisonStatus = (oldValue, newValue) => {
    if (oldValue === newValue) {
        return 'unchanged';
    } else if (oldValue < newValue) {
        return 'raised';
    }
    return 'lowered';
};
const linkMap = {};
chrome.notifications.onClicked.addListener((id) => {
    if (linkMap[id]) {
        chrome.tabs.create({url: linkMap[id]});
    }
});

const saveDataWithChanges = async (key, data, skipNotifications) => {
    const {trackedCurrencies} = await getItem('settings');
    const oldData = await getItem(key);
    if (!oldData) {
        return setItem(key, data.map(item => ({...item, buyStatus: 'unchanged', sellStatus: 'unchanged'})));
    }
    const comparedData = data.map(item => {
        const oldItem = oldData.find(record => record.currency === item.currency);
        item.buyStatus = getComparisonStatus(oldItem.buy, item.buy);
        item.sellStatus = getComparisonStatus(oldItem.sell, item.sell);
        return item;
    });
    if (!skipNotifications) {
        comparedData
            .filter(item => [item.buyStatus, item.sellStatus].some(status => status !== 'unchanged') && trackedCurrencies.some(tracked => tracked.currency === item.currency))
            .forEach(item => {
                const oldItem = oldData.find(record => record.currency === item.currency);
                let message = '';
                if (item.buyStatus !== 'unchanged') {
                    message += `Ціна купівлі валюти ${item.currency} змінилась з ${oldItem.buy} до ${item.buy}. \n`;
                }
                if (item.sellStatus !== 'unchanged') {
                    message += `Ціна продажу валюти ${item.currency} змінилась з ${oldItem.buy} до ${item.buy}. \n`;
                }
                const id = `${key}-buy-changed-${Date.now()}`;
                chrome.notifications.create(id, {type: 'basic', title: bankTitles[key], iconUrl: 'icon-256.png', message}, (notificationId) => {linkMap[notificationId] = bankUrls[key]});
                setTimeout(() => {
                    chrome.notifications.clear(id);
                    delete linkMap[id];
                }, 20000);
            });
    }
    await setItem(key, comparedData);
};

const parseRulya = () => fetch('http://rulya-bank.com.ua/', {mode: 'cors'}).then(res => res.text());
export const updateRulya = (skipNotifications = false) => parseRulya().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('#ltbl tr:not(:first-child)')]
        .map(tr => ({
            currency: tr.querySelector('td b').textContent === 'PLZ' ? 'PLN' : tr.querySelector('td b').textContent,
            buy: Number(tr.querySelector('td:nth-child(2)').textContent),
            sell: Number(tr.querySelector('td:nth-child(3)').textContent),
        }));
})
    .then((data) => saveDataWithChanges('rulya', data, skipNotifications));

const parsePiramida = () => fetch('http://www.piramida.rv.ua/', {mode: 'cors'}).then(res => res.text());
export const updatePiramida = (skipNotifications = false) => parsePiramida().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('#maintb tbody tr')].map((tr) => ({
        currency: tr.querySelector('td:nth-child(1)').textContent,
        buy: Number(tr.querySelector('td:nth-child(2)').textContent),
        sell: Number(tr.querySelector('td:nth-child(3)').textContent),
    }));
})
    .then((data) => saveDataWithChanges('piramida', data, skipNotifications));

const reformatLionCurrency = (abbr) => lionCurrency[abbr];
const parseLion = () => fetch('https://lion-kurs.com.ua/', {mode: 'cors'}).then(res => res.text());
export const updateLion = (skipNotifications = false) => parseLion().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('.content table tbody tr:not(:first-child):not(:last-child)')].map((tr) => ({
        currency: reformatLionCurrency(tr.querySelector('.valuta img').getAttribute('src').match(new RegExp('\/(?<currency>[a-z]+)')).groups.currency),
        buy: Number(tr.querySelector('td:nth-child(1)').textContent),
        sell: Number(tr.querySelector('td:nth-child(3)').textContent),
    }));
})
    .then((data) => saveDataWithChanges('lion', data, skipNotifications));

export const updateAllData = async (skipNotifications = false) => {
    await updateRulya(skipNotifications);
    await updatePiramida(skipNotifications);
    await updateLion(skipNotifications);
};
