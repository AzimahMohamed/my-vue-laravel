<template>
  <div>
    <input v-model="search" placeholder="Search..." @input="filterCountries" />
    <table>
      <thead>
        <tr>
          <th @click="sortBy('name')">Name</th>
          <th @click="sortBy('region')">Region</th>
          <th @click="sortBy('capital')">Capital</th>
          <th>Flag</th>
          <th>Favorite</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="country in sortedCountries" :key="country.cca3">
          <td>
            <template v-for="(part, index) in getHighlightedParts(country.name.common)">
              <span :key="index" v-if="part.highlighted" class="highlighted">{{ part.text }}</span>
              <template v-else>{{ part.text }}</template>
            </template>
          </td>
          <td>
            <template v-for="(part, index) in getHighlightedParts(country.region)">
              <span :key="index" v-if="part.highlighted" class="highlighted">{{ part.text }}</span>
              <template v-else>{{ part.text }}</template>
            </template>
          </td>
          <td>
            <template v-for="(part, index) in getHighlightedParts(country.capital ? country.capital[0] : 'N/A')">
              <span :key="index" v-if="part.highlighted" class="highlighted">{{ part.text }}</span>
              <template v-else>{{ part.text }}</template>
            </template>
          </td>
          <td><img :src="country.flags.png" alt="flag" width="50"></td>
          <td>
            <input type="checkbox" :checked="country.favorite" @change="toggleFavorite(country)" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Bar Chart Component -->
    <bar-chart :countries="selectedCountries" />
  </div>
</template>

<script>
import axios from 'axios';
import BarChart from './BarChart.vue'; // Assuming you have a BarChart component

export default {
  components: {
    BarChart
  },
  data() {
    return {
      countries: [],
      filteredCountries: [],
      search: '',
      sortKey: '',
      sortDirection: 'asc',
      favorites: []
    };
  },
  created() {
    this.fetchCountries();
  },
  computed: {
    sortedCountries() {
      const sorted = [...this.filteredCountries];
      if (this.sortKey) {
        sorted.sort((a, b) => {
          const modifier = this.sortDirection === 'asc' ? 1 : -1;
          if (this.sortKey === 'name') {
            return modifier * a.name.common.localeCompare(b.name.common, 'en', { sensitivity: 'base' });
          } else {
            return modifier * (a[this.sortKey] < b[this.sortKey] ? -1 : 1);
          }
        });
      }
      return sorted;
    },
    selectedCountries() {
      return this.countries.filter(country => country.favorite);
    }
  },
  methods: {
    async fetchCountries() {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        this.countries = response.data;
        this.filteredCountries = this.countries;
        this.loadFavorites();
        this.applyFavorites();
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    },
    filterCountries() {
      const searchTerm = this.search.toLowerCase();
      this.filteredCountries = this.countries.filter(country => {
        return (
          country.name.common.toLowerCase().includes(searchTerm) ||
          country.region.toLowerCase().includes(searchTerm) ||
          (country.capital && country.capital[0].toLowerCase().includes(searchTerm))
        );
      });
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDirection = 'asc';
      }
    },
    toggleFavorite(country) {
      country.favorite = !country.favorite;
      this.saveFavorites();
    },
    loadFavorites() {
      const savedFavorites = localStorage.getItem('favorites');
      this.favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    },
    applyFavorites() {
      this.countries.forEach(country => {
        country.favorite = this.favorites.includes(country.cca3);
      });
    },
    saveFavorites() {
      this.favorites = this.countries.filter(country => country.favorite).map(country => country.cca3);
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    },
    getHighlightedParts(text) {
      const parts = [];
      if (!this.search) {
        parts.push({ text, highlighted: false });
        return parts;
      }

      const searchTermRegex = new RegExp(`(${this.escapeRegExp(this.search)})`, 'gi');
      let match;
      let lastIndex = 0;

      while ((match = searchTermRegex.exec(text)) !== null) {
        const beforeMatch = text.slice(lastIndex, match.index);
        if (beforeMatch) {
          parts.push({ text: beforeMatch, highlighted: false });
        }
        const matchedText = match[0];
        parts.push({ text: matchedText, highlighted: true });
        lastIndex = match.index + matchedText.length;
      }

      const restText = text.slice(lastIndex);
      if (restText) {
        parts.push({ text: restText, highlighted: false });
      }

      return parts;
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

img {
  display: block;
  margin: 0 auto;
}

.highlighted {
  background-color: yellow;
}
</style>
