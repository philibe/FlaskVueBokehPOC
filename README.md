# This POC is coming from StackOverflow post

- my question :  [Flask with `import bokeh` with 2 bokeh graphs without external bokeh server and not "Models must be owned by only a single document"](https://stackoverflow.com/questions/68224939/flask-with-import-bokeh-with-2-bokeh-graphs-without-external-bokeh-server-and/68240148)
- my auto answer: [Here is a POC with import bokeh without external bokeh server and with vue (vue3,vuex4, composition-api) because I didn't found a tutorial for my needs.](https://stackoverflow.com/questions/68224939/flask-with-import-bokeh-with-2-bokeh-graphs-without-external-bokeh-server-and/68240148#68240148)

# My answer updated a little for github

Here is a POC with `import bokeh` without external bokeh server and with vue (vue3,vuex4, composition-api) because I didn't found a tutorial for my needs.

There are 2 bokeh graphs linked by a lasso via [`js_on_change()` python side (url)](https://docs.bokeh.org/en/latest/docs/user_guide/interaction/callbacks.html) and[`Bokeh.embed.embed_item()` js side, via `json_item()` python side (url)](https://docs.bokeh.org/en/latest/docs/user_guide/embed.html).

- Flask
  - api datas
  - api Python Bokeh functions


- VueJs
  - Vue 3
  - vuex 4
  - management of data feedback in a `<ol> <li>` list and 2 bokeh graphs in a template view via API composition 
  
Look at https://github.com/philibe/FlaskVueBokehPOC for the source code detail.  

## Import issue

Because of [discourse.bokeh.org: Node12 import error bokeh 2.0](https://discourse.bokeh.org/t/node12-import-error-bokeh-2-0/5061) I call bokehjs by the DOM javascript `window.Bokeh. ...` in `frontend/src/pages/ProdSinusPage.vue`. 

I've seen this Github Issue #10658 (opened):[[FEATURE] Target ES5/ES6 with BokehJS ](https://github.com/bokeh/bokeh/issues/10658).


## Links
- https://docs.bokeh.org/en/latest/docs/user_guide/interaction/callbacks.html
- https://docs.bokeh.org/en/latest/docs/user_guide/embed.html
- https://stackoverflow.com/questions/37083998/flask-bokeh-ajaxdatasource
- https://discourse.bokeh.org/t/node12-import-error-bokeh-2-0/5061
- https://github.com/bokeh/bokeh/issues/10658
- https://stackoverflow.com/questions/5869216/how-to-store-node-js-deployment-settings-configuration-files/66749910#66749910
- https://stackoverflow.com/questions/50828904/using-environment-variables-with-vue-js/57295959#57295959
- https://github.com/vuejs/vuex/tree/4.0/examples/composition/shopping-cart
- https://www.digitalocean.com/community/tutorials/how-to-build-a-shopping-cart-with-vue-3-and-vuex
- https://github.com/vuejs/vuex/tree/4.0/examples/composition
- https://www.codimth.com/blog/web/vuejs/how-use-composition-api-vuejs-3
- https://markus.oberlehner.net/blog/vue-3-composition-api-vs-options-api/

## Code abstract

__server/config.py__
```python
SECRET_KEY = 'GITHUB6202f13e27c5'
PORT_FLASK_DEV = 8071
PORT_FLASK_PROD = 8070
PORT_NODE_DEV = 8072
```

__server/app.py__
```python
from flask import (
    Flask,
    jsonify,
    request,
    render_template,
    flash,
    redirect,
    url_for,
    session,
    send_from_directory,
    # abort,
)

from bokeh.layouts import row, column, gridplot, widgetbox

from flask_cors import CORS
import uuid
import os


from bokeh.embed import json_item, components
from bokeh.plotting import figure, curdoc
from bokeh.models.sources import AjaxDataSource, ColumnDataSource


from bokeh.models import CustomJS

# from bokeh.models.widgets import Div

bokeh_tool_tips = [
    ("index", "$index"),
    ("(x,y)", "($x, $y)"),
    # ("desc", "@desc"),
]

bokeh_tool_list = ['pan,wheel_zoom,lasso_select,reset']

import math
import json


from flask_debugtoolbar import DebugToolbarExtension

from werkzeug.utils import import_string

from werkzeug.serving import run_simple
from werkzeug.middleware.dispatcher import DispatcherMiddleware


def create_app(PROD, DEBUG):

    app = Flask(__name__)

    app.dir_app = os.path.abspath(os.path.dirname(__file__))
    app.app_dir_root = os.path.dirname(app.dir_app)
    app.app_dir_nom = os.path.basename(app.dir_app)

    print(app.dir_app)
    print(app.app_dir_root)
    print(app.app_dir_nom)

    if not PROD:
        CORS(app, resources={r'/*': {'origins': '*'}})
        template_folder = '../frontend/public'
        static_url_path = 'static'
        static_folder = '../frontend/public/static'

    else:
        template_folder = '../frontend/dist/'
        static_url_path = 'static'
        static_folder = '../frontend/dist/static'

    app.template_folder = template_folder
    app.static_url_path = static_url_path
    app.static_folder = static_folder

    # à rajouter
    # app.wsgi_app = ReverseProxied(app.wsgi_app, script_name='/' + app.app_dir_nom)

    app.debug = DEBUG

    app.config.from_pyfile('config.py')
    if DEBUG:
        toolbar = DebugToolbarExtension()
        toolbar.init_app(app)

    @app.before_first_request
    def initialize():
        session.clear()
        if not session.get('x'):
            session['x'] = 0
        if not session.get('y'):
            session['y'] = 0
        if not session.get('HistoryArray'):
            session['HistoryArray'] = [{'x': None, 'y': None}]

    @app.route('/')
    def index():
        VariableFlask = 'VariableFlaskRendered'
        return render_template('index.html', VariableFlask=VariableFlask)

    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/x-icon')

    @app.route('/static/plugins_node_modules/<path:path>')
    def send_plugins_(path):
        print(app.app_dir_root)
        print(os.path.join(app.app_dir_root, 'frontend', 'node_modules'))
        return send_from_directory((os.path.join(app.app_dir_root, 'frontend', 'node_modules')), path)

    # https://stackoverflow.com/questions/37083998/flask-bokeh-ajaxdatasource
    # https://github.com/bokeh/bokeh/blob/main/examples/embed/json_item.py

    @app.route("/api/datasinus/<operation>", methods=['GET', 'POST'])
    def get_x(operation):
        if not session.get('x'):
            session['x'] = 0
        if not session.get('y'):
            session['y'] = 0
        if not session.get('HistoryArray'):
            session['HistoryArray'] = [{'x': None, 'y': None}]

        # global x, y
        if operation == 'increment':
            session['x'] = session['x'] + 0.1

        session['y'] = math.sin(session['x'])

        if operation == 'increment':
            session['HistoryArray'].append({'x': session['x'], 'y': session['y']})
            return jsonify(x=[session['x']], y=[session['y']])
        else:
            response_object = {'status': 'success'}
            # malist[-10:] last n elements
            # malist[::-1] reversing using list slicing
            session['HistoryArray'] = session['HistoryArray'][-10:]
            response_object['sinus'] = session['HistoryArray'][::-1]
            return jsonify(response_object)

    @app.route("/api/bokehinlinejs", methods=['GET', 'POST'])
    def simple():
        streaming = True

        s1 = AjaxDataSource(data_url="/api/datasinus/increment", polling_interval=1000, mode='append')

        s1.data = dict(x=[], y=[])

        s2 = ColumnDataSource(data=dict(x=[], y=[]))

        s1.selected.js_on_change(
            'indices',
            CustomJS(
                args=dict(s1=s1, s2=s2),
                code="""
            var inds = cb_obj.indices;
            var d1 = s1.data;
            var d2 = s2.data;
            d2['x'] = []
            d2['y'] = []
            for (var i = 0; i < inds.length; i++) {
                d2['x'].push(d1['x'][inds[i]])
                d2['y'].push(d1['y'][inds[i]])
            }
            s2.change.emit();
            
            """,
            ),
        )

        p1 = figure(
            x_range=(0, 10),
            y_range=(-1, 1),
            plot_width=400,
            plot_height=400,
            title="Streaming, take lasso to copy points (refresh after)",
            tools=bokeh_tool_list,
            tooltips=bokeh_tool_tips,
            name="p1",
        )
        p1.line('x', 'y', source=s1, color="blue", selection_color="green")
        p1.circle('x', 'y', size=1, source=s1, color=None, selection_color="red")

        p2 = figure(
            x_range=p1.x_range,
            y_range=(-1, 1),
            plot_width=400,
            plot_height=400,
            tools=bokeh_tool_list,
            title="Watch here catched points",
            tooltips=bokeh_tool_tips,
            name="p2",
        )
        p2.circle('x', 'y', source=s2, alpha=0.6)

        response_object = {}
        response_object['gr'] = {}

        script, div = components({'p1': p1, 'p2': p2}, wrap_script=False)
        response_object['gr']['script'] = script
        response_object['gr']['div'] = div
        return response_object

    return app


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('--PROD', action='store_true')
    parser.add_argument('--DEBUG', action='store_true')
    args = parser.parse_args()

    DEBUG = args.DEBUG
    PROD = args.PROD

    print('DEBUG=', DEBUG)
    print('PROD=', PROD)

    app = create_app(PROD=PROD, DEBUG=DEBUG)

    if not PROD:
        PORT = app.config["PORT_FLASK_DEV"]
    else:
        PORT = app.config["PORT_FLASK_PROD"]

    if DEBUG:
        app.run(host='0.0.0.0', port=PORT, debug=DEBUG)

    else:
        from waitress import serve

        serve(app, host="0.0.0.0", port=PORT)

```
__frontend/src/main.js__
```javascript
import { createApp, prototype } from "vue";
import store from "@/store/store.js";
import App from "@/App.vue";
import router from "@/router/router.js";
import "./../node_modules/bulma/css/bulma.css";

// https://v3.vuejs.org/guide/migration/filters.html#migration-strategy
// "Filters are removed from Vue 3.0 and no longer supported"
// Vue.filter('currency', currency)

const app = createApp(App).use(store).use(router);

app.mount("#app");
```

__frontend/src/pages/ProdSinusPage.vue__
```vue
<style>
  [..]
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

  var temp1 = result.gr;
  document.getElementById("bokeh_ch1").innerHTML = temp1.div.p1;
  document.getElementById("bokeh_ch2").innerHTML = temp1.div.p2;
  eval(temp1.script);
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

```

__frontend/src/api/apisinus.js__
```javascript
import axios from "axios";

export default {
  apiGetBokehinlinejs(callback) {
    axios
      .get("/api/bokehinlinejs")
      .then((response) => {
        console.log(response.data);
        callback(response.data);
      })
      .catch((err) =>
        console.log(
          (process.env.NODE_ENV || "dev") == "build"
            ? err.message
            : JSON.stringify(err)
        )
      );
  },
  apiGetDatasinus(callback) {
    axios
      .get("/api/datasinus/read")
      .then((response) => {
        //console.log(response.data)
        callback(response.data.sinus);
      })
      .catch((err) =>
        console.log(
          (process.env.NODE_ENV || "dev") == "build"
            ? err.message
            : JSON.stringify(err)
        )
      );
  },
};
```

__frontend/src/store/modules/modprodsinus/modprodsinus.js__
```javascript
import apisinus from "@/api/apisinus.js";

// initial state
const state = {
  bokehinlinejs: [],
  datasinus: [],
};

const getters = {
  datasinus: (state) => {
    return state.datasinus;
  },
};

// https://github.com/vuejs/vuex/tree/4.0/examples/composition/shopping-cart

// actions
const actions = {
  GetBokehinlinejs({ commit }) {
    apisinus.apiGetBokehinlinejs((bokehinlinejs) => {
      commit("setBokehinlinejs", bokehinlinejs);
    });
  },
  GetDataSinus({ commit }) {
    apisinus.apiGetDatasinus((datasinus) => {
      commit("setDataSinus", datasinus);
    });
  },
};

// mutations
const mutations = {
  setBokehinlinejs(state, bokehinlinejs) {
    state.bokehinlinejs = bokehinlinejs;
  },
  setDataSinus(state, datasinus) {
    state.datasinus = datasinus;
  },
};

const modprodsinus = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default modprodsinus;
```
__frontend/src/router/router.js__
```javascript
import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import About from "@/pages/About.vue";
import About2Comp from "@/pages/About2Comp.vue";

import prodsinuspage from "@/pages/ProdSinusPage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/about2",
    name: "About2",
    component: About2Comp,
  },
  {
    path: "/prodsinuspage",
    name: "prodsinuspage",
    component: prodsinuspage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
```


__frontend/src/store/store.js__
```javascript
import { createStore } from "vuex";
import modprodsinus from "./modules/modprodsinus/modprodsinus.js";

// https://www.digitalocean.com/community/tutorials/how-to-build-a-shopping-cart-with-vue-3-and-vuex

export default createStore({
  modules: {
    modprodsinus,
  },
});
```
frontend/
__package.json, vue_node_serve.js,vue_node_build.js__
```javascript
package.json:
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "NODE_ENV='dev' node vue_node_serve.js ",
    "build": "NODE_ENV='build' node vue_node_build.js ",
    "lint": "vue-cli-service lint"
  },
[..]
frontend/vue_node_serve.js:
const config = require("./config");

require("env-dot-prop").set("CONFIG.PORTFLASK", config.port_flask);
require("env-dot-prop").set("CONFIG.PORTNODEDEV", config.port_node_dev);
require("child_process").execSync(
  "vue-cli-service serve --port " + config.port_node_dev,
  { stdio: "inherit" }
);
frontend/vue_node_build.js:
const config = require("./config");
require("env-dot-prop").set("CONFIG.PORTFLASK", config.port_flask);
require("child_process").execSync("vue-cli-service build", {
  stdio: "inherit",
});
````

__frontend/vue.config.js__
```javascript
// https://stackoverflow.com/questions/50828904/using-environment-variables-with-vue-js/57295959#57295959
// https://www.fatalerrors.org/a/vue3-explains-the-configuration-of-eslint-step-by-step.html

const webpack = require("webpack");

const env = process.env.NODE_ENV || "dev";

const path = require("path");

module.exports = {
  indexPath: "index.html",
  assetsDir: "static/app/",

  configureWebpack: {
    resolve: {
      extensions: [".js", ".vue", ".json", ".scss"],
      alias: {
        styles: path.resolve(__dirname, "src/assets/scss"),
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        // allow access to process.env from within the vue app
        "process.env": {
          NODE_ENV: JSON.stringify(env),
          CONFIG_PORTFLASK: JSON.stringify(process.env.CONFIG_PORTFLASK),
          CONFIG_PORTNODEDEV: JSON.stringify(process.env.PORTNODEDEV),
        },
      }),
    ],
  },

  devServer: {
    watchOptions: {
      poll: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:" + process.env.CONFIG_PORTFLASK + "/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },

      "/static/plugins_node_modules": {
        target: "http://localhost:" + process.env.CONFIG_PORTFLASK + "/",
        changeOrigin: true,
        pathRewrite: {
          "^/static/plugins_node_modules": "/static/plugins_node_modules/",
        },
      },
    },
  },

  chainWebpack: (config) => {
    config.module
      .rule("vue")
      .use("vue-loader")
      .loader("vue-loader")
      .tap((options) => {
        options.compilerOptions = {
          delimiters: ["[[", "]]"],
        };
        return options;
      });
  },

  lintOnSave: true,
};

// https://prettier.io/docs/en/install.html
// https://www.freecodecamp.org/news/dont-just-lint-your-code-fix-it-with-prettier/

```
__frontend/config.js__
```javascript
// https://stackoverflow.com/questions/5869216/how-to-store-node-js-deployment-settings-configuration-files
// https://stackoverflow.com/questions/41767409/read-from-file-and-find-specific-lines/41767642#41767642

function getValueByKey(text, key) {
  var regex = new RegExp("^" + key + "\\s{0,1}=\\s{0,1}(.*)$", "m");
  var match = regex.exec(text);
  if (match) {
    return match[1];
  } else {
    return null;
  }
}

function getValueByKeyInFilename(key, filename) {
  return getValueByKey(
    require("fs").readFileSync(filename, { encoding: "utf8" }),
    key
  );
}

const python_config_filename = "../server/config.py";

const env = process.env.NODE_ENV || "dev";

var config_temp = {
  dev: {
    port_flask: getValueByKeyInFilename(
      "PORT_FLASK_DEV",
      python_config_filename
    ),
    port_node_dev: getValueByKeyInFilename(
      "PORT_NODE_DEV",
      python_config_filename
    ),
  },
  build: {
    port_flask: getValueByKeyInFilename(
      "PORT_FLASK_PROD",
      python_config_filename
    ),
  },
};
var config = {
  ...config_temp[env],
};

module.exports = config;
```
