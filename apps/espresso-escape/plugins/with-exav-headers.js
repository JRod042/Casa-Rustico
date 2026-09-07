const { withDangerousMod } = require("expo/config-plugins");
const path = require("path");
const fs = require("fs");

/** Point EXAV at compat ExpoModulesCore headers if the 57 module map omitted them. */
function withExavHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      if (!fs.existsSync(podfile)) return cfg;
      let text = fs.readFileSync(podfile, "utf8");
      if (text.includes("exav-compat-headers")) return cfg;
      const snippet = `
    extra_header = File.expand_path("../scripts/exav-compat-headers", __dir__)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        paths = bc.build_settings["HEADER_SEARCH_PATHS"]
        paths = ["$(inherited)"] if paths.nil?
        paths = [paths] unless paths.is_a?(Array)
        quoted = "\\"#{extra_header}\\""
        bc.build_settings["HEADER_SEARCH_PATHS"] = paths + [quoted] unless paths.include?(quoted)
      end
    end
`;
      if (text.includes("post_install do |installer|")) {
        text = text.replace("post_install do |installer|", `post_install do |installer|${snippet}`);
      }
      fs.writeFileSync(podfile, text);
      return cfg;
    },
  ]);
}

module.exports = withExavHeaders;
