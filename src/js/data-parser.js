import {getItem, lionCurrency, setItem} from "../helpers";

const getComparisonStatus = (oldValue, newValue) => {
    if (oldValue === newValue) {
        return 'unchanged';
    } else if (oldValue < newValue) {
        return 'raised';
    }
    return 'lowered';
};

const saveDataWithChanges = async (key, data) => {
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
    await setItem(key, comparedData);
};

const parseRulya = () => fetch('http://rulya-bank.com.ua/', {mode: 'cors'}).then(res => res.text());
export const updateRulya = () => parseRulya().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('#ltbl tr:not(:first-child)')]
        .map(tr => ({
            currency: tr.querySelector('td b').textContent,
            buy: Number(tr.querySelector('td:nth-child(2)').textContent),
            sell: Number(tr.querySelector('td:nth-child(3)').textContent),
        }));
})
    .then((data) => saveDataWithChanges('rulya', data));

const parsePiramida = () => fetch('http://www.piramida.rv.ua/', {mode: 'cors'}).then(res => res.text());
export const updatePiramida = () => parsePiramida().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('#maintb tbody tr')].map((tr) => ({
        currency: tr.querySelector('td:nth-child(1)').textContent,
        buy: Number(tr.querySelector('td:nth-child(2)').textContent),
        sell: Number(tr.querySelector('td:nth-child(3)').textContent),
    }));
})
    .then((data) => saveDataWithChanges('piramida', data));

const reformatLionCurrency = (abbr) => lionCurrency[abbr];
const parseLion = () => fetch('https://lion-kurs.com.ua/', {mode: 'cors'}).then(res => res.text());
export const updateLion = () => parseLion().then(response => {
    const doc = new DOMParser().parseFromString(response, 'text/html');
    return [...doc.querySelectorAll('.content table tbody tr:not(:first-child):not(:last-child)')].map((tr) => ({
        currency: reformatLionCurrency(tr.querySelector('.valuta img').getAttribute('src').match(new RegExp('\/(?<currency>[a-z]+)')).groups.currency),
        buy: Number(tr.querySelector('td:nth-child(1)').textContent),
        sell: Number(tr.querySelector('td:nth-child(3)').textContent),
    }));
})
    .then((data) => saveDataWithChanges('lion', data));

export const updateAllData = async () => {
    await updateRulya();
    await updatePiramida();
    await updateLion();
};
