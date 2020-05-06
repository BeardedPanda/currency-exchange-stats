export const getItem = key => {
	return new Promise(resolve => chrome.storage.sync.get([key], item => resolve(item[key] || null)));
};

export const setItem = async (key, value) => chrome.storage.sync.set({ [key]: value });
export const removeItem = async key => chrome.storage.sync.remove(key);
export const clearStorage = async () => chrome.storage.sync.clear();
export const onChange = cb => chrome.storage.onChanged.addListener((changes, namespace) => (namespace === "sync" ? cb(changes) : false));

export default {
	getItem,
	setItem,
	removeItem,
	clearStorage,
	onChange,
};
