<section class="popup-wrapper">
    <h1 class="has-text-centered">Currency exchange stats</h1>
    <table class="table is-bordered is-striped is-fullwidth">
        <thead>
        <tr>
            <th rowspan="2"></th>
            <th colspan="2">
                <p><img class="logo" src="http://rulya-bank.com.ua/favicon.ico" alt=""></p>
                <a href="javascript:" on:click="{() => openTab('http://rulya-bank.com.ua/')}">Rulya Bank</a>
            </th>
            <th colspan="2">
                <p><img class="logo" src="https://lion-kurs.com.ua/image/slogo.ico" alt=""></p>
                <a href="javascript:" on:click="{() => openTab('https://lion-kurs.com.ua/')}">Lion Kurs</a>
            </th>
            <th colspan="2">
                <p><img class="logo" src="http://www.piramida.rv.ua/img/logo-piramida.png" alt=""></p>
                <a href="javascript:" on:click="{() => openTab('http://www.piramida.rv.ua/')}">Piramida</a>
            </th>
        </tr>
        <tr>
            <th>Buy</th>
            <th>Sell</th>
            <th>Buy</th>
            <th>Sell</th>
            <th>Buy</th>
            <th>Sell</th>
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
                    { item.rulya.buy }
                </td>
                <td class="{item.bestSell === item.rulya.sell ? 'has-text-link' : ''}">
                    {#if (item.rulya.sellStatus !== 'unchanged')}
                        <img class="arrows" alt={item.rulya.sellStatus} src={`/${item.rulya.sellStatus}.svg`}>
                    {/if}
                    { item.rulya.sell }
                </td>
                <td class="{item.bestBuy === item.lion.buy ? 'has-text-link' : ''}">
                    {#if (item.lion.buyStatus !== 'unchanged')}
                        <img class="arrows" alt={item.lion.buyStatus} src={`/${item.lion.buyStatus}.svg`}>
                    {/if}
                    { item.lion.buy }
                </td>
                <td class="{item.bestSell === item.lion.sell ? 'has-text-link' : ''}">
                    {#if (item.lion.sellStatus !== 'unchanged')}
                        <img class="arrows" alt={item.lion.sellStatus} src={`/${item.lion.sellStatus}.svg`}>
                    {/if}
                    { item.lion.sell }
                </td>
                <td class="{item.bestBuy === item.piramida.buy ? 'has-text-link' : ''}">
                    {#if (item.piramida.buyStatus !== 'unchanged')}
                        <img class="arrows" alt={item.rulya.buyStatus} src={`/${item.piramida.buyStatus}.svg`}>
                    {/if}
                    { item.piramida.buy }
                </td>
                <td class="{item.bestSell === item.piramida.sell ? 'has-text-link' : ''}">
                    {#if (item.piramida.sellStatus !== 'unchanged')}
                        <img class="arrows" alt={item.piramida.sellStatus} src={`/${item.piramida.sellStatus}.svg`}>
                    {/if}
                    { item.piramida.sell }
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
</section>

<script>
    import {getItem} from '../helpers/storage';
    import {onMount} from 'svelte';

    const openTab = (url) => chrome.tabs.create({url});
    let rulyaData = [];
    let lionData = [];
    let piramidaData = [];
    let tableData = [];
    onMount(async () => {
        rulyaData = await getItem('rulya');
        lionData = await getItem('lion');
        piramidaData = await getItem('piramida');
        tableData = ['USD', 'EUR'].map((currency) => {
            const rulya = rulyaData.find(item => item.currency === currency);
            const lion = lionData.find(item => item.currency === currency);
            const piramida = piramidaData.find(item => item.currency === currency);
            const bestBuy = Math.max(rulya.buy, lion.buy, piramida.buy);
            const bestSell = Math.min(rulya.sell, lion.sell, piramida.sell);
            return {
                currency,
                bestBuy,
                bestSell,
                rulya,
                lion,
                piramida,
            };
        });
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
        width: 500px;
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
</style>
