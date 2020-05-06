import Options from "../components/Options.svelte";

new Options({
	target: document.body,
});

document.addEventListener("contextmenu", e => e.preventDefault(), false);
