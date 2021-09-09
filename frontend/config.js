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
