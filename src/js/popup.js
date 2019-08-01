import PopUp from '../components/Popup.svelte';

new PopUp({
    target: document.body,
});
document.addEventListener('contextmenu', e => e.preventDefault(), false);
