<section>
    <section class="hero is-small is-info is-bold">
        <div class="hero-body">
            <div class="container">
                <div class="columns">
                    <div class="column">
                        <h1 class="title">
                            Currency Exchange Stats
                        </h1>
                        <h2 class="subtitle">
                            <Translate prop="settingsTitle" />
                        </h2>
                    </div>
                    <div class="column has-text-right">
                        <button class="button is-success is-large" on:click={saveSettings} disabled={!showCurrencies.length}><Translate prop="save" /></button>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section class="section">
        <div class="container">
            <h1 class="title"><Translate prop="showExchange" /></h1>
            <h2 class="subtitle">
                <Translate prop="showExchangeDescr" />
            </h2>
            {#each supportedCurrencies as currency}
                <p>
                    <label class="checkbox">
                        <input type="checkbox" bind:group={showCurrencies} value={currency}>
                        {currency}
                    </label>
                </p>
            {/each}
            {#if !showCurrencies.length}
                <p class="has-text-danger"><Translate prop="noCurrencyCheckedError" /></p>
            {/if}
        </div>
    </section>
    <section class="section">
        <div class="container">
            <h1 class="title"><Translate prop="trackExchange" /></h1>
            <h2 class="subtitle">
                <Translate prop="trackExchangeDescr" />
            </h2>
            {#each supportedCurrencies as currency, index}
                <p>
                    <label class="checkbox">
                        <input type="checkbox" bind:group={trackedCurrenciesByName} value={currency}
                               disabled={!showCurrencies.includes(currency)}>
                        {currency}
                    </label>
                </p>
                {#if buySellTrack[currency]}
                    <section class="ml-1">
                        <label class="checkbox">
                            <input type="checkbox" bind:checked={buySellTrack[currency].buy}>
                            <Translate prop="buy" />
                        </label>
                        <label class="checkbox">
                            <input type="checkbox" bind:checked={buySellTrack[currency].sell}>
                            <Translate prop="sell" />
                        </label>
                    </section>
                {/if}
            {/each}
        </div>
    </section>
    <section class="section">
        <div class="container">
            <h1 class="title"><Translate prop="refreshFrequency" /></h1>
            <h2 class="subtitle">
                <Translate prop="refreshFrequencyDescr" />
            </h2>
            <div class="select">
                <select bind:value="{updatePeriod}">
                    <option value={1}>1 <Translate prop="minuteAbbr" /></option>
                    <option value={5}>5 <Translate prop="minuteAbbr" /></option>
                    <option value={10}>10 <Translate prop="minuteAbbr" /></option>
                    <option value={15}>15 <Translate prop="minuteAbbr" /></option>
                    <option value={30}>30 <Translate prop="minuteAbbr" /></option>
                </select>
            </div>
        </div>
    </section>
    <section class="section">
        <div class="container">
            <h1 class="title"><Translate prop="languageSetting" /></h1>
            <h2 class="subtitle">
                <Translate prop="languageSettingDescr" />
            </h2>
            <div class="select">
                <select bind:value="{language}">
                    <option value={'uk'}>Українська</option>
                    <option value={'en'}>English</option>
                </select>
            </div>
        </div>
    </section>
</section>

<script>
    import swal from 'sweetalert2';
    import {onMount} from 'svelte';
    import {getItem, setItem} from '../helpers/storage';
    import {supportedCurrencies} from '../helpers/constants';
    import {t} from '../helpers/multilang-plugin';
    import Translate from './Translate.svelte';

    let trackedCurrencies = [];
    let trackedCurrenciesByName = [];
    let showCurrencies = [];
    let buySellTrack = {};
    let updatePeriod = 15;
    let language = 'uk';

    onMount(async () => {
        const settings = await getItem('settings');
        language = settings.language;
        updatePeriod = settings.updatePeriod;
        trackedCurrencies = settings.trackedCurrencies;
        trackedCurrenciesByName = settings.trackedCurrencies.map(item => item.currency);
        settings.trackedCurrencies.forEach(item => {
            buySellTrack[item.currency] = item;
        });
        showCurrencies = settings.showCurrencies;
    });

    const onShowCurrencyChange = (showCurrencies) => {
        trackedCurrenciesByName = trackedCurrenciesByName.filter(item => showCurrencies.includes(item));
    };
    $: onShowCurrencyChange(showCurrencies);

    const onTrackCurrencyByNameChange = (currencyArray) => {
        buySellTrack = currencyArray.reduce((object, currency) => {
            object[currency] = buySellTrack[currency] || {currency, buy: true, sell: true};
            return object;
        }, {});
    };
    $: onTrackCurrencyByNameChange(trackedCurrenciesByName);

    const saveSettings = async () => {
        try {
            await setItem('settings', {
                showCurrencies,
                updatePeriod,
                language,
                trackedCurrencies: Object.values(buySellTrack).filter(item => item.buy || item.sell)
            });
            swal.fire({
                type: 'success',
                title: await t('settingsSavedMessage'),
                showConfirmButton: false,
                timer: 1500
            })
                    .then((result) => {
                        if (result.dismiss) {
                            window.location.reload();
                        }
                    });

        } catch (e) {
            swal.fire({
                title: await t('settingsNotSavedMessage'),
                type: 'error',
                text: e.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };
</script>

<style>
    .ml-1 {
        margin-left: 1rem;
    }

    .section {
        padding-bottom: 0;
    }
</style>
