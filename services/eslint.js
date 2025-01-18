import { writeFile } from "fs/promises";
import { eslintConfigJs, eslintConfigTs } from "../constants/constants.js";

export const createEslintConfig = async (answers, projectDir) => {
  if (!answers.useEsLint) return;
  const isTs = answers.framework === "TypeScript";

  if (isTs) {
    await writeFile(`${projectDir}/eslint.config.js`, eslintConfigTs);
  } else {
    await writeFile(`${projectDir}/eslint.config.js`, eslintConfigJs);
  }
};
