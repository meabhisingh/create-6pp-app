import { dockerIgnoreContent } from "../constants/constants.js";
import { writeFile } from "fs/promises";

export const createDockerFile = async (answers, projectDir) => {
  if (!answers.useDocker) return;

  // Creating Dockerfile
  const dockerFileContent = [
    "FROM node:20",
    "WORKDIR /usr/src/app",
    "COPY package*.json ./",
    "RUN npm install",
    "COPY . .",
  ];

  if (answers.framework === "TypeScript")
    dockerFileContent.push("RUN npm run build");

  dockerFileContent.push(`CMD ["npm", "start"]`);

  await writeFile(`${projectDir}/Dockerfile`, dockerFileContent.join("\n"));
  await writeFile(`${projectDir}/.dockerignore`, dockerIgnoreContent);
};
