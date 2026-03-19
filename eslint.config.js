const nextConfig = require("eslint-config-next");

module.exports = [
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off"
    }
  },
  {
    ignores: ["jasmine-project (21)/**"]
  }
];
