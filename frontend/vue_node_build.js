const config = require("./config");
require("env-dot-prop").set("CONFIG.PORTFLASK", config.port_flask);
require("child_process").execSync("vue-cli-service build", {
  stdio: "inherit",
});
