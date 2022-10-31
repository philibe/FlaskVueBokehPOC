<style>
* {
  box-sizing: border-box;
}

.column {
  float: left;
  padding: 10px;
  height: 300px;
}

.left,
.right {
  width: 25%;
}

.middle {
  width: 50%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}
</style>
<template>
  <div class="row" style="width: 60%">
    <div id="bokeh_ch1" class="column left"></div>
    <div class="column middle">
      <ul>
        <li v-for="data in datasinus" :key="data.x">
          [[ currency(data.x,'',2) ]] - [[currency(data.y,'',2) ]]
        </li>
      </ul>
    </div>
    <div id="bokeh_ch2" class="column right"></div>
  </div>
</template>

<script setup>
// https://v3.vuejs.org/api/sfc-script-setup.html
import { computed, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { currency } from "@/currency";

//https://github.com/vuejs/vuex/tree/4.0/examples/composition/shopping-cart

//var Bokeh = require("bokeh.min.js");

import * as Bokeh from "bokeh.min.js";
// console.log(Bokeh);

window.Bokeh = Bokeh.Bokeh;

const store = useStore();

const bokehinlinejs = computed(() => store.state.modprodsinus.bokehinlinejs);

async function get1stJsonbokeh() {
  const promise = new Promise((resolve /*, reject */) => {
    setTimeout(() => {
      return resolve(bokehinlinejs.value);
    }, 1001);
  });
  let result = await promise;

  var temp1 = result.gr;
  document.getElementById("bokeh_ch1").innerHTML = temp1.div.p1;
  document.getElementById("bokeh_ch2").innerHTML = temp1.div.p2;
  let newscript = temp1.script
    .replace("Bokeh.safely", "window.Bokeh.safely")
    .replaceAll("root.Bokeh", "window.Bokeh")
    .replace("attempts > 100", "attempts > 1000");

  console.log(newscript);

  eval(newscript);
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
