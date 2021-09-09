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
