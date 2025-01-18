#!/usr/bin/env node

import inquirer from "inquirer";
import { questions } from "./constants/questions.js";
import { createBaseFile } from "./services/basefile.js";
import {
  createDependencies,
  createPackageJson,
} from "./services/dependency.js";
import { createDockerFile } from "./services/docker.js";
import { createErrorHandler } from "./services/error-handler.js";
import { createEslintConfig } from "./services/eslint.js";
import { createGraphQLService } from "./services/graphql.js";
import {
  createImportLines,
  createMiddlewareLines,
} from "./services/import-lines.js";
import { logMessages } from "./services/log.js";
import { createMongoDBService } from "./services/mongodb.js";
import { createProjectDir } from "./services/project-directory.js";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const flags = {
    skipPrompts: args.includes("-y") || args.includes("--yes"),
    projectName: args.find((arg) => !arg.startsWith("-")) || "myapp",
  };
  return flags;
};

const getAnswers = async () => {
  const flags = parseArgs();

  if (flags.skipPrompts) {
    return {
      name: flags.projectName,
      framework: "TypeScript",
      useMongoDB: false,
      useGraphQL: false,
      useCors: true,
      useErrorHandler: true,
      useEnvFile: true,
      useMorgan: true,
      useDocker: true,
      useEsLint: true,
      usePathAlias: true,
      useAutoInstall: true,
    };
  }

  return inquirer.prompt(questions);
};

async function createApp() {
  try {
    console.log("Welcome to the Express.js project generator! 🚀");

    const answers = await getAnswers();

    const projectName = answers.name || "myapp";

    const projectDir = `./${projectName}`;
    const fileExtension = answers.framework === "JavaScript" ? "js" : "ts";

    // Create project directory
    await createProjectDir(answers, projectDir);

    //  Create MongoDB
    await createMongoDBService(answers, projectDir, projectName);

    //  Create GraphQL
    await createGraphQLService(answers, projectDir);

    // Configure error handler (optional)
    await createErrorHandler(answers, projectDir);

    const importLines = await createImportLines(answers, projectDir);
    const middlewareLines = createMiddlewareLines(answers);

    // Create appropriate base files
    await createBaseFile(
      importLines,
      answers,
      middlewareLines,
      projectDir,
      fileExtension
    );

    // Eslint configuration
    await createEslintConfig(answers, projectDir);

    // Creating Dockerfile
    await createDockerFile(answers, projectDir);

    // Creating package.json
    const { dependencies, devDependencies } = await createDependencies(answers);

    await createPackageJson(
      answers,
      dependencies,
      devDependencies,
      projectDir,
      projectName
    );

    await logMessages(answers, projectName, projectDir);
  } catch (error) {
    console.error(error);
  }
}

createApp().catch((error) => {
  console.error(error);
});
