<section class="popup-wrapper">
    <h1 class="has-text-centered">Currency exchange stats</h1>
    <table class="table is-bordered is-striped is-fullwidth">
        <thead>
        <tr>
            <th rowspan="2"></th>
            <th colspan="2">
                <p><img class="logo" src="http://rulya-bank.com.ua/favicon.ico" alt=""></p>
                <a href="javascript:" on:click="{() => openTab(bankUrls.rulya)}">{ bankTitles.rulya }</a>
            </th>
            <th colspan="2">
                <p><img class="logo" src="https://lion-kurs.com.ua/image/slogo.ico" alt=""></p>
                <a href="javascript:" on:click="{() => openTab(bankUrls.lion)}">{ bankTitles.lion }</a>
            </th>
            <th colspan="2">
                <p><img class="logo" src="http://www.piramida.rv.ua/img/logo-piramida.png" alt=""></p>
                <a href="javascript:" on:click="{() => openTab(bankUrls.piramida)}">{ bankTitles.piramida }</a>
            </th>
            <th colspan="2">
                <p><img class="logo" src="https://goverla.ua/static/imgs/favicon.gif" alt=""></p>
                <a href="javascript:" on:click="{() => openTab(bankUrls.goverla)}">{ bankTitles.goverla }</a>
            </th>
        </tr>
        <tr>
            <th><Translate prop="buy" /></th>
            <th><Translate prop="sell" /></th>
            <th><Translate prop="buy" /></th>
            <th><Translate prop="sell" /></th>
            <th><Translate prop="buy" /></th>
            <th><Translate prop="sell" /></th>
            <th><Translate prop="buy" /></th>
            <th><Translate prop="sell" /></th>
        </tr>
        </thead>
        <tbody>
        {#each tableData as item}
            <tr>
                <th>{ item.currency }</th>
                <td class="{item.bestBuy === item.rulya.buy ? 'has-text-link' : ''}">
                    {#if (item.rulya.buyStatus !== 'unchanged')}
                        <img class="arrows" alt={item.rulya.buyStatus} src={`/${item.rulya.buyStatus}.svg`}>
                    {/if}
                    { item.rulya.buy.toFixed(2) }
                </td>
                <td class="{item.bestSell === item.rulya.sell ? 'has-text-link' : ''}">
                    {#if (item.rulya.sellStatus !== 'unchanged')}
                        <img class="arrows" alt={item.rulya.sellStatus} src={`/${item.rulya.sellStatus}.svg`}>
                    {/if}
                    { item.rulya.sell.toFixed(2) }
                </td>
                <td class="{item.bestBuy === item.lion.buy ? 'has-text-link' : ''}">
                    {#if (item.lion.buyStatus !== 'unchanged')}
                        <img class="arrows" alt={item.lion.buyStatus} src={`/${item.lion.buyStatus}.svg`}>
                    {/if}
                    { item.lion.buy.toFixed(2) }
                </td>
                <td class="{item.bestSell === item.lion.sell ? 'has-text-link' : ''}">
                    {#if (item.lion.sellStatus !== 'unchanged')}
                        <img class="arrows" alt={item.lion.sellStatus} src={`/${item.lion.sellStatus}.svg`}>
                    {/if}
                    { item.lion.sell.toFixed(2) }
                </td>
                <td class="{item.bestBuy === item.piramida.buy ? 'has-text-link' : ''}">
                    {#if (item.piramida.buyStatus !== 'unchanged')}
                        <img class="arrows" alt={item.rulya.buyStatus} src={`/${item.piramida.buyStatus}.svg`}>
                    {/if}
                    { item.piramida.buy.toFixed(2) }
                </td>
                <td class="{item.bestSell === item.piramida.sell ? 'has-text-link' : ''}">
                    {#if (item.piramida.sellStatus !== 'unchanged')}
                        <img class="arrows" alt={item.piramida.sellStatus} src={`/${item.piramida.sellStatus}.svg`}>
                    {/if}
                    { item.piramida.sell.toFixed(2) }
                </td>
                <td class="{item.bestBuy === item.goverla.buy ? 'has-text-link' : ''}">
                    {#if (item.goverla.buyStatus !== 'unchanged')}
                        <img class="arrows" alt={item.rulya.buyStatus} src={`/${item.goverla.buyStatus}.svg`}>
                    {/if}
                    { item.goverla.buy.toFixed(2) }
                </td>
                <td class="{item.bestSell === item.goverla.sell ? 'has-text-link' : ''}">
                    {#if (item.goverla.sellStatus !== 'unchanged')}
                        <img class="arrows" alt={item.goverla.sellStatus} src={`/${item.goverla.sellStatus}.svg`}>
                    {/if}
                    { item.goverla.sell.toFixed(2) }
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
    <footer class="popup-footer">
        {#if (tableData[0])}
            <div class="has-text-grey">
                <Translate prop="lastUpdated" />: { tableData[0].updatedAt }
                <img src="refresh.svg" class={loading ? 'refresh-button is-rotating' : 'refresh-button'} alt="Оновити дані" on:click={refreshData}>
            </div>
        {:else}
            <span></span>
        {/if}
        <a href="javascript:" on:click={openSettingsTab}>
            <img src="/settings.svg" class="settings-image" alt="">
            <Translate prop="settings" />
        </a>
    </footer>
</section>

<script>
    import dayjs from 'dayjs';
    import {getItem} from '../helpers/storage';
    import {onMount} from 'svelte';
    import {updateAllData} from '../js/data-parser';
    import {bankTitles, bankUrls} from '../helpers/constants';
    import Translate from './Translate.svelte';

    const openTab = (url) => chrome.tabs.create({url});
    let rulyaData = [];
    let lionData = [];
    let piramidaData = [];
    let goverlaData = [];
    let tableData = [];
    let loading = false;

    const openSettingsTab = () => {
        chrome.tabs.query({title: 'Currency Exchange Stats: Options'}, (tabs) => {
            if (tabs.length) {
                if (tabs[0].active) {
                    window.close();
                } else {
                    chrome.tabs.update(tabs[0].id, { highlighted: true });
                }
            } else {
                chrome.tabs.create({url: '/options.html'});
            }
        })
    };

    const getAndFormatData = async () => {
        rulyaData = await getItem('rulya');
        lionData = await getItem('lion');
        piramidaData = await getItem('piramida');
        goverlaData = await getItem('goverla');
        const {showCurrencies} = await getItem('settings');
        tableData = showCurrencies.map((currency) => {
            const rulya = rulyaData.find(item => item.currency === currency);
            const lion = lionData.find(item => item.currency === currency);
            const piramida = piramidaData.find(item => item.currency === currency);
            const goverla = goverlaData.find(item => item.currency === currency);
            const bestBuy = Math.max(rulya.buy, lion.buy, piramida.buy, goverla.buy);
            const bestSell = Math.min(rulya.sell, lion.sell, piramida.sell, goverla.buy);
            const updatedAt = dayjs(Math.max(rulya.updatedAt, lion.updatedAt, piramida.updatedAt)).format('DD/MM/YYYY HH:mm:ss');
            return {
                currency,
                bestBuy,
                bestSell,
                rulya,
                lion,
                piramida,
                goverla,
                updatedAt,
            };
        });
    };
    const refreshData = async () => {
        loading = true;
        await updateAllData();
        await getAndFormatData();
        loading = false;
    };
    onMount(async () => {
        await getAndFormatData();
    });
</script>

<style>
    h1 {
        font-weight: bold;
        margin-bottom: .5rem;
        text-transform: uppercase;
    }

    .popup-wrapper {
        padding: 1rem;
        width: 800px;
    }

    .logo {
        max-height: 13px;
    }

    .arrows {
        height: 15px;
        width: 15px;
    }

    table td, table th {
        text-align: center;
    }

    .popup-footer {
        display: flex;
        justify-content: space-between;
    }

    .settings-image {
        height: .8rem;
    }

    .refresh-button {
        height: .8rem;
        cursor: pointer;
    }

    .refresh-button.is-rotating {
        -webkit-animation:spin 1s linear infinite;
        -moz-animation:spin 1s linear infinite;
        animation:spin 1s linear infinite;
    }
    @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
    @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
    @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
</style>
