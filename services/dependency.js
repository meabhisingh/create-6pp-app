import { getLatestVersion } from "../api/api.js";
import { connectRedis } from "../config/redis.js";
import { writeFile } from "fs/promises";

export const createDependencies = async (answers) => {
  let redis = null;
  try {
    redis = await connectRedis();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }

  const isTS = answers.framework === "TypeScript";

  const dependenciesPromise = [
    getLatestVersion("express", redis),
    getLatestVersion("helmet", redis),
  ];

  if (answers.useGraphQL) {
    dependenciesPromise.push(getLatestVersion("@apollo/server", redis));
    dependenciesPromise.push(getLatestVersion("graphql", redis));
  }
  if (answers.useCors)
    dependenciesPromise.push(getLatestVersion("cors", redis));
  if (answers.useMorgan)
    dependenciesPromise.push(getLatestVersion("morgan", redis));
  if (answers.useEnvFile)
    dependenciesPromise.push(getLatestVersion("dotenv", redis));

  if (answers.useMongoDB)
    dependenciesPromise.push(getLatestVersion("mongoose", redis));

  const devDependenciesPromise = isTS
    ? [
        getLatestVersion("typescript", redis),
        getLatestVersion("@types/express", redis),
        getLatestVersion("@types/node", redis),
        getLatestVersion("tsx", redis),
        getLatestVersion("@types/helmet", redis),
      ]
    : [getLatestVersion("nodemon", redis)];

  if (answers.useCors && isTS)
    devDependenciesPromise.push(getLatestVersion("@types/cors", redis));
  if (answers.useMorgan && isTS)
    devDependenciesPromise.push(getLatestVersion("@types/morgan", redis));

  if (answers.usePathAlias && isTS)
    devDependenciesPromise.push(getLatestVersion("tsc-alias", redis));

  if (answers.useEsLint) {
    devDependenciesPromise.push(getLatestVersion("eslint", redis));
    devDependenciesPromise.push(getLatestVersion("@eslint/js", redis));
    devDependenciesPromise.push(getLatestVersion("globals", redis));
    if (isTS)
      devDependenciesPromise.push(getLatestVersion("typescript-eslint", redis));
  }

  const dependenciesRaw = await Promise.all(dependenciesPromise);
  const devDependenciesRaw = await Promise.all(devDependenciesPromise);

  redis.disconnect();

  const dependencies = dependenciesRaw.map(
    (dependency) => `"${dependency.name}": "${dependency.version}"`
  );

  const devDependencies = devDependenciesRaw.map(
    (dependency) => `"${dependency.name}": "${dependency.version}"`
  );

  return { dependencies, devDependencies };
};

export const createPackageJson = async (
  answers,
  dependencies,
  devDependencies,
  projectDir,
  projectName
) => {
  const isTS = answers.framework === "TypeScript";
  const isEslint = answers.useEsLint;
  const isPath = answers.usePathAlias;

  const npmScriptsJs = {
    start: "set NODE_ENV=PRODUCTION & node app.js",
    dev: "nodemon app.js",
  };
  const npmScriptsTs = {
    start: "set NODE_ENV=PRODUCTION & node dist/app.js",
    build: "tsc -p .",
    dev: "tsx watch src/app.ts",
  };

  if (isEslint) {
    npmScriptsJs.lint = "eslint . ";
    npmScriptsTs.lint = "eslint src";
    npmScriptsJs["lint:fix"] = "eslint . --fix";
    npmScriptsTs["lint:fix"] = "eslint src --fix";
    npmScriptsTs.build = "npm run lint && tsc -p .";
  }

  if (isPath) {
    npmScriptsTs.build += " && tsc-alias";
  }

  const packageJsonContent = `
{
 "name": "${projectName}",
 "version": "1.0.0",
 "description": "",
 "main": ${isTS ? '"dist/app.js"' : '"app.js"'},
 "scripts": ${
   isTS ? JSON.stringify(npmScriptsTs) : JSON.stringify(npmScriptsJs)
 } ,
 "keywords": [],
 "author": "",
 "type": "module",
 "license": "ISC",
 "dependencies": { 
    ${dependencies.join(",")}  
 }, 
 "devDependencies": {
    ${devDependencies.join(",")}
 }
}`;

  await writeFile(`${projectDir}/package.json`, packageJsonContent);
};
