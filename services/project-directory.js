import { mkdir } from "fs/promises";

export const createProjectDir = async (answers, projectDir) => {
  const isTS = answers.framework === "TypeScript";

  if (isTS) {
    await mkdir(projectDir, { recursive: true });
    await mkdir(`${projectDir}/src`, { recursive: true });
    await mkdir(`${projectDir}/src/routes`, { recursive: true });
    await mkdir(`${projectDir}/src/models`, { recursive: true });
    await mkdir(`${projectDir}/src/controllers`, { recursive: true });
    await mkdir(`${projectDir}/src/middlewares`, { recursive: true });
    await mkdir(`${projectDir}/src/utils`, { recursive: true });
    await mkdir(`${projectDir}/src/lib`, { recursive: true });
    await mkdir(`${projectDir}/tests`, { recursive: true });
  } else {
    await mkdir(projectDir, { recursive: true });
    await mkdir(`${projectDir}/routes`, { recursive: true });
    await mkdir(`${projectDir}/models`, { recursive: true });
    await mkdir(`${projectDir}/controllers`, { recursive: true });
    await mkdir(`${projectDir}/middlewares`, { recursive: true });
    await mkdir(`${projectDir}/utils`, { recursive: true });
    await mkdir(`${projectDir}/lib`, { recursive: true });
    await mkdir(`${projectDir}/tests`, { recursive: true });
  }
};
