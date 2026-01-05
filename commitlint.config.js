export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0],
    "header-max-length": [2, "always", 100],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^(?::\w+:\s)?(\w+):\s(.+)$/,
      headerCorrespondence: ["type", "subject"],
    },
  },
};
