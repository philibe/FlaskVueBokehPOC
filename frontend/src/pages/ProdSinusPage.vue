<template>
  <div id="mygraph" style="display: inline; float: left"></div>
  <div style="display: inline">
    <ul>
      <li v-for="data in datasinus" :key="data.x">
        [[ currency(data.x,'',2) ]] - [[currency(data.y,'',2) ]]
      </li>
    </ul>
  </div>
</template>

<script setup>
// https://v3.vuejs.org/api/sfc-script-setup.html
import { computed, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { currency } from "@/currency";

//https://github.com/vuejs/vuex/tree/4.0/examples/composition/shopping-cart

const store = useStore();
const prodsinus = computed(() => store.state.modprodsinus.prodsinus);

async function get1stProduct() {
  const promise = new Promise((resolve /*, reject */) => {
    setTimeout(() => {
      resolve(prodsinus.value);
    }, 1001);
  });
  let result = await promise;
  console.log(result);
}
get1stProduct();
const bokehinlinejs = computed(() => store.state.modprodsinus.bokehinlinejs);

async function get1stJsonbokeh() {
  const promise = new Promise((resolve /*, reject */) => {
    setTimeout(() => {
      return resolve(bokehinlinejs.value);
    }, 1001);
  });
  let result = await promise;

  //console.log(JSON.parse(JSON.stringify(result.gr)));

  window.Bokeh.embed.embed_item(result.gr, "mygraph");
}
get1stJsonbokeh();

var productCheckInterval = null;
const datasinus = computed(() => store.state.modprodsinus.datasinus);

//console.log(datasinus)

async function getDataSinusPolling() {
  const promise = new Promise((resolve /*, reject */) => {
    setTimeout(() => {
      resolve(datasinus);
    }, 1001);
  });
  let result = await promise;

  clearInterval(productCheckInterval);
  productCheckInterval = setInterval(() => {
    store.dispatch("modprodsinus/GetDataSinus");
    //console.log(productCheckInterval)
  }, 1000);
}

getDataSinusPolling();

const beforeDestroy = onBeforeUnmount(() => {
  clearInterval(productCheckInterval);
  console.log("beforeDestroy");
});

store.dispatch("modprodsinus/GetBokehinlinejs");
</script>
