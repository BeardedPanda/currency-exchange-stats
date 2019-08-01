import {getItem, setItem} from "../helpers/storage";
import {bankTitles, bankUrls, lionCurrencyFormats, supportedCurrencies} from "../helpers/constants";
import {showNotification} from "../helpers/notification";

const getComparisonStatus = (oldValue, newValue) => {
    if (oldValue === newValue) {
        return 'unchanged';
    } else if (oldValue < newValue) {
        return 'raised';
    }
    return 'lowered';
};

const saveDataWithChanges = async (key, data, skipNotifications) => {
    const {trackedCurrencies} = await getItem('settings');
    const oldData = await getItem(key);
    if (!oldData) {
        return setItem(key, data.map(item => ({...item, buyStatus: 'unchanged', sellStatus: 'unchanged', updatedAt: Date.now()})));
    }
    const comparedData = data
        .filter(item => supportedCurrencies.includes(item.currency))
        .map(item => {
        const oldItem = oldData.find(record => record.currency === item.currency);
        item.buyStatus = getComparisonStatus(oldItem.buy, item.buy);
        item.sellStatus = getComparisonStatus(oldItem.sell, item.sell);
        item.updatedAt = Date.now();
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
                    message += `Ціна продажу валюти ${item.currency} змінилась з ${oldItem.sell} до ${item.sell}. \n`;
                }
                showNotification(`${key}-buy-changed-${Date.now()}`, bankTitles[key], message, bankUrls[key]);
            });
    }
    await setItem(key, comparedData);
};

const parseRulya = () => fetch(bankUrls.rulya, {mode: 'cors'}).then(res => res.text());
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

const parsePiramida = () => fetch(bankUrls.piramida, {mode: 'cors'}).then(res => res.text());
export const updatePiramida = (skipNotifications = false) => parsePiramida().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('#maintb tbody tr')]
        .map((tr) => ({
            currency: tr.querySelector('td:nth-child(1)').textContent,
            buy: Number(tr.querySelector('td:nth-child(2)').textContent),
            sell: Number(tr.querySelector('td:nth-child(3)').textContent),
        }));
})
    .then((data) => saveDataWithChanges('piramida', data, skipNotifications));

const reformatLionCurrency = (abbr) => lionCurrencyFormats[abbr];
const parseLion = () => fetch(bankUrls.lion, {mode: 'cors'}).then(res => res.text());
export const updateLion = (skipNotifications = false) => parseLion().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('.content table tbody tr:not(:first-child):not(:last-child)')]
        .map((tr) => ({
            currency: reformatLionCurrency(tr.querySelector('.valuta img').getAttribute('src').match(new RegExp('\/(?<currency>[a-z]+)')).groups.currency),
            buy: Number(tr.querySelector('td:nth-child(1)').textContent),
            sell: Number(tr.querySelector('td:nth-child(3)').textContent),
        }));
})
    .then((data) => saveDataWithChanges('lion', data, skipNotifications));

const parseGoverla = () => fetch(bankUrls.goverla, {mode: 'cors'}).then(res => res.text());
export const updateGoverla = (skipNotifications = false) => parseGoverla().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('#rates .gvrl-table .gvrl-table-body .gvrl-table-row')]
        .map((tr) => ({
            currency: tr.querySelector('.gvrl-table-cell:nth-child(1) img').getAttribute('alt'),
            buy: Number(tr.querySelector('.gvrl-table-cell:nth-child(2)').textContent) / 100,
            sell: Number(tr.querySelector('.gvrl-table-cell:nth-child(3)').textContent) / 100,
        }));
})
    .then((data) => saveDataWithChanges('goverla', data, skipNotifications));

export const updateAllData = async (skipNotifications = false) => {
    await updateRulya(skipNotifications);
    await updatePiramida(skipNotifications);
    await updateLion(skipNotifications);
    await updateGoverla(skipNotifications);
};
