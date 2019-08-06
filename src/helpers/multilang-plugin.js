import {getItem} from './storage';
import {dictionary} from './constants';

let defaultLanguage = 'uk';
let language;

let proxy = new Proxy(dictionary, {
    get(target, prop) {
        if (prop in target[language]) {
            return target[language][prop];
        } else if (prop in target[defaultLanguage]) {
            return target[defaultLanguage][prop];
        }
        return '---';
    }
});

export const t = async (key) => {
    if (!language) {
        language = (await getItem('settings')).language || defaultLanguage;
    }
    return proxy[key];
};
