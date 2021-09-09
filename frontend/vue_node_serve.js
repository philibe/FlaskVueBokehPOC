const config = require("./config");

require("env-dot-prop").set("CONFIG.PORTFLASK", config.port_flask);
require("env-dot-prop").set("CONFIG.PORTNODEDEV", config.port_node_dev);
require("child_process").execSync(
  "vue-cli-service serve --port " + config.port_node_dev,
  { stdio: "inherit" }
);
