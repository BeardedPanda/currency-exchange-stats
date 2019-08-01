<section>
<!--    <Notifications bind:this={notifications}></Notifications>-->
    <div id="notif"></div>
    <section class="hero is-small is-info is-bold">
        <div class="hero-body">
            <div class="container">
                <h1 class="title">
                    Currency Exchange Stats
                </h1>
                <h2 class="subtitle">
                    Extension settings
                </h2>
            </div>
        </div>
    </section>
    <section class="section">
        <div class="container">
            <h1 class="title">Показувати курс</h1>
            <h2 class="subtitle">
                Виберіть валюти, які мають бути показані у таблиці спливаючого вікна додатку.
            </h2>
            {#each supportedCurrencies as currency}
                <p>
                    <label class="checkbox">
                        <input type="checkbox" bind:group={showCurrencies} value={currency}>
                        {currency}
                    </label>
                </p>
            {/each}
        </div>
    </section>
    <section class="section">
        <div class="container">
            <h1 class="title">Відслідковувати курс</h1>
            <h2 class="subtitle">
                При зміні курсу вибраної валюти вам буде показано повідомлення, про зміни.
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
                            Купівля
                        </label>
                        <label class="checkbox">
                            <input type="checkbox" bind:checked={buySellTrack[currency].sell}>
                            Продаж
                        </label>
                    </section>
                {/if}
            {/each}
        </div>
    </section>
    <section class="section">
        <div class="container">
            <h1 class="title">Частота оновлень</h1>
            <h2 class="subtitle">
                Ви можете вказати, наскільки часто оновлювати інформацію.
            </h2>
            <div class="select">
                <select bind:value="{updatePeriod}">
                    <option value={1}>1 хв</option>
                    <option value={5}>5 хв</option>
                    <option value={10}>10 хв</option>
                    <option value={15}>15 хв</option>
                    <option value={30}>30 хв</option>
                </select>
            </div>
        </div>
    </section>
    <section class="section">
        <div class="container has-text-right">
            {#if !showCurrencies.length}
                <p class="has-text-danger">Виберіть хоча б одну з валют.</p>
            {/if}
            <button class="button is-large is-info" on:click={saveSettings} disabled={!showCurrencies.length}>
                Save
            </button>
        </div>
    </section>
</section>

<script>
    import Notifications from '@beyonk/svelte-notifications';
    import {supportedCurrencies} from '../helpers/constants';
    import {getItem, setItem} from '../helpers/storage';
    import {onMount} from 'svelte';

    let notifications;

    let trackedCurrencies = [];
    let trackedCurrenciesByName = [];
    let showCurrencies = [];
    let buySellTrack = {};
    let updatePeriod = 15;

    onMount(async () => {
        const settings = await getItem('settings');
        updatePeriod = settings.updatePeriod;
        trackedCurrencies = settings.trackedCurrencies;
        trackedCurrenciesByName = settings.trackedCurrencies.map(item => item.currency);
        settings.trackedCurrencies.forEach(item => {
            buySellTrack[item.currency] = item;
        });
        showCurrencies = settings.showCurrencies;
        notifications = new Notifications(
                {
                    target: document.querySelector('#notif'),
                    props: {
                        themes: { // These are the defaults
                            danger: '#bb2124',
                            success: 'hsl(141, 71%, 48%)',
                            warning: '#f0ad4e',
                            info: '#5bc0de',
                            default: '#aaaaaa' // relates to simply '.show()'
                        },
                        timeout: 1000,
                    }
                }
        )
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
                trackedCurrencies: Object.values(buySellTrack).filter(item => item.buy || item.sell)
            });
            notifications.success('Налаштування збережено!', 1000);
        } catch (e) {
            notifications.danger(e.message, 1000);
        }
    };
</script>

<style>
    .ml-1 {
        margin-left: 1rem;
    }
</style>
