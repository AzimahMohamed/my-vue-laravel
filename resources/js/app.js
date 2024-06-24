import { createApp } from 'vue';
import CountriesTable from './components/CountriesTables.vue';

const app = createApp({});

app.component('countries-table', CountriesTable);

app.mount('#app');