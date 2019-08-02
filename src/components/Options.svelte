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
                            Налаштування розширення
                        </h2>
                    </div>
                    <div class="column has-text-right">
                        <button class="button is-success is-large" on:click={saveSettings} disabled={!showCurrencies.length}>Зберегти</button>
                    </div>
                </div>
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
            {#if !showCurrencies.length}
                <p class="has-text-danger">Виберіть хоча б одну з валют.</p>
            {/if}
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
</section>

<script>
    import swal from 'sweetalert2';
    import {onMount} from 'svelte';
    import {getItem, setItem} from '../helpers/storage';
    import {supportedCurrencies} from '../helpers/constants';

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
            swal.fire({
                type: 'success',
                title: 'Зміни успішно збережено!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (e) {
            swal.fire({
                title: 'Зміни не збережено!',
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
