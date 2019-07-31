const linkMap = {};
chrome.notifications.onClicked.addListener((id) => {
    if (linkMap[id]) {
        chrome.tabs.create({url: linkMap[id]});
    }
});

export const showNotification = (id, title, message, url) => {
    chrome.notifications.create(id, {type: 'basic', title, iconUrl: 'icon-256.png', message}, (notificationId) => {linkMap[notificationId] = url});
    setTimeout(() => {
        chrome.notifications.clear(id);
        delete linkMap[id];
    }, 5000);
};
