{#await t(prop) then value}
    { value }
{/await}

<script>
    import {t} from '../helpers/multilang-plugin';
    export let prop;
</script>
