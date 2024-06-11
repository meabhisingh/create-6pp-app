#!/usr/bin/env node

import fs from "fs";
import inquirer from "inquirer";
import { getLatestVersion } from "./api/api.js";
import { connectRedis } from "./config/redis.js";
import chalk from "chalk";

const questions = [
  {
    type: "input",
    name: "name",
    message: "Enter your project name:",
    default: "myapp",
  },
  {
    type: "list",
    name: "framework",
    message: "Select your preferred language:",
    choices: ["JavaScript", "TypeScript"],
    default: "TypeScript",
  },
  {
    type: "confirm",
    name: "useCors",
    message: "Do you want to enable CORS?",
    default: false,
  },
  {
    type: "confirm",
    name: "useErrorHandler",
    message: "Do you want to use a basic error handler?",
    default: true,
  },
  {
    type: "confirm",
    name: "useEnvFile",
    message: "Do you want to use an environment file?",
    default: true,
  },

  {
    type: "confirm",
    name: "useMorgan",
    message: "Do you want to use morgan for logging?",
    default: true,
  },
  {
    type: "confirm",
    name: "useDocker",
    message: "Do you want to use Docker for deployment?",
    default: false,
  },
];

const jsErrorMiddleware = `import { envMode } from "../app.js";

export const errorMiddleware = (err, req, res, next)=> {

  err.message||= "Internal Server Error";
  err.statusCode = err.statusCode || 500;
  
  const response = {
    success: false,
    message: err.message,
  };

  if (envMode === "DEVELOPMENT") {
    response.error = err;
  }

  return res.status(err.statusCode).json(response);

};

export const TryCatch = (passedFunc) => async (req, res, next) => {
  try {
    await passedFunc(req, res, next);
  } catch (error) {
    next(error);
  }
};


`;

const tsErrorMiddleware = `
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler.js";
import { envMode } from "../app.js";

export const errorMiddleware = (err:ErrorHandler, req:Request, res:Response, next:NextFunction)=> {

  err.message||= "Internal Server Error";
  err.statusCode = err.statusCode || 500;
  
  const response:{
    success: boolean,
    message: string,
    error?:ErrorHandler
  } = {
    success: false,
    message: err.message,
  };

  if (envMode === "DEVELOPMENT") {
    response.error = err;
  }

  return res.status(err.statusCode).json(response);

};

type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export const TryCatch = (passedFunc:ControllerType) => async (req:Request, res:Response, next:NextFunction) => {
  try {
    await passedFunc(req, res, next);
  } catch (error) {
    next(error);
  }
};

`;

const jsErrorHandler = ` export default class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}`;

const tsErrorHandler = `export default class ErrorHandler extends Error {
  constructor(public statusCode: number,public message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}`;

const dockerIgnoreContent = [
  "node_modules",
  "npm-debug.log",
  ".git",
  ".idea",
  ".vscode",
  ".env",
  "dist",
].join("\n");

async function createApp() {
  try {
    console.log("Welcome to the Express.js project generator! 🚀");

    const answers = await inquirer.prompt(questions);

    const projectName = answers.name;
    const projectDir = `./${projectName}`;
    const fileExtension = answers.framework === "JavaScript" ? "js" : "ts";

    // Create project directory
    if (!fs.existsSync(projectDir)) {
      if (answers.framework === "TypeScript") {
        fs.mkdirSync(projectDir);
        fs.mkdirSync(`${projectDir}/src`);
        fs.mkdirSync(`${projectDir}/src/routes`);
        fs.mkdirSync(`${projectDir}/src/models`);
        fs.mkdirSync(`${projectDir}/src/controllers`);
        fs.mkdirSync(`${projectDir}/src/middlewares`);
        fs.mkdirSync(`${projectDir}/src/utils`);
        fs.mkdirSync(`${projectDir}/src/lib`);
        fs.mkdirSync(`${projectDir}/src/tests`);
      } else {
        fs.mkdirSync(projectDir);
        fs.mkdirSync(`${projectDir}/routes`);
        fs.mkdirSync(`${projectDir}/models`);
        fs.mkdirSync(`${projectDir}/controllers`);
        fs.mkdirSync(`${projectDir}/middlewares`);
        fs.mkdirSync(`${projectDir}/utils`);
        fs.mkdirSync(`${projectDir}/lib`);
        fs.mkdirSync(`${projectDir}/tests`);
      }
    }

    // Configure error handler (optional)
    if (answers.useErrorHandler) {
      if (answers.framework === "TypeScript") {
        fs.writeFileSync(
          `${projectDir}/src/middlewares/error.ts`,
          tsErrorMiddleware
        );
        fs.writeFileSync(
          `${projectDir}/src/utils/errorHandler.ts`,
          tsErrorHandler
        );
      } else {
        fs.writeFileSync(
          `${projectDir}/middlewares/error.js`,
          jsErrorMiddleware
        );
        fs.writeFileSync(`${projectDir}/utils/errorHandler.js`, jsErrorHandler);
      }
    }

    const importLines = [`import express from 'express'`];
    const middlewareLines = [
      `app.use(express.json());`,
      `app.use(express.urlencoded({extended: true}));`,
    ];

    if (answers.useCors) {
      importLines.push(`import cors from 'cors'`);
      middlewareLines.push(`app.use(cors({origin:' * ',credentials:true}));`);
    }
    if (answers.useErrorHandler)
      importLines.push(
        `import {errorMiddleware} from './middlewares/error.js'`
      );

    if (answers.useMorgan) {
      importLines.push(`import morgan from 'morgan'`);
      middlewareLines.push(`app.use(morgan('dev'))`);
    }

    if (answers.useEnvFile) {
      importLines.push(`import dotenv from 'dotenv'`);
      const envFileContent = `PORT=4000`;
      fs.writeFileSync(`${projectDir}/.env`, envFileContent);
    }

    const baseFileContent = `${importLines.join("\n")}


  ${answers.useEnvFile ? "dotenv.config({path: './.env',});" : ""}

  export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
  const port = process.env.PORT || 3000;


  const app = express();


 ${middlewareLines.join("\n")} 


  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

  // your routes here

  
  app.get("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Page not found'
    });
  });

  ${answers.useErrorHandler ? "app.use(errorMiddleware);" : ""}
  
  
  app.listen(port, () => console.log('Server is working on Port:'+port+' in '+envMode+' Mode.'));`;

    // Create appropriate base files

    if (answers.framework === "TypeScript") {
      fs.writeFileSync(
        `${projectDir}/src/app.${fileExtension}`,
        baseFileContent
      );
      fs.writeFileSync(
        `${projectDir}/tsconfig.json`,
        `{
          "compilerOptions": {
            "target": "ES2020",
            "module": "ES2020",
            "moduleResolution": "Node",
            "esModuleInterop": true,
            "rootDir": "src",
            "outDir": "dist",
            "strict": true,
            "forceConsistentCasingInFileNames": true
          },
          "include": ["src/**/*.ts"],
          "exclude": ["node_modules"]
        }`
      );
    } else {
      fs.writeFileSync(`${projectDir}/app.${fileExtension}`, baseFileContent);
    }

    // Creating Dockerfile
    if (answers.useDocker) {
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

      fs.writeFileSync(
        `${projectDir}/Dockerfile`,
        dockerFileContent.join("\n")
      );
      fs.writeFileSync(`${projectDir}/.dockerignore`, dockerIgnoreContent);
    }

    // Creating package.json

    let redis = null;
    // try {
    //   redis = await connectRedis();
    // } catch (error) {
    //   console.error("Failed to connect to Redis:", error);
    // }

    const dependenciesPromise = [getLatestVersion("express", redis)];

    if (answers.useCors)
      dependenciesPromise.push(getLatestVersion("cors", redis));
    if (answers.useMorgan)
      dependenciesPromise.push(getLatestVersion("morgan", redis));
    if (answers.useEnvFile)
      dependenciesPromise.push(getLatestVersion("dotenv", redis));

    const devDependenciesPromise = [
      getLatestVersion("nodemon", redis),
      getLatestVersion("typescript", redis),
      getLatestVersion("@types/express", redis),
      getLatestVersion("@types/node", redis),
    ];

    if (answers.useCors)
      devDependenciesPromise.push(getLatestVersion("@types/cors", redis));
    if (answers.useMorgan)
      devDependenciesPromise.push(getLatestVersion("@types/morgan", redis));

    const dependenciesRaw = await Promise.all(dependenciesPromise);
    const devDependenciesRaw = await Promise.all(devDependenciesPromise);

    redis.disconnect();

    const dependencies = dependenciesRaw.map(
      (dependency) => `"${dependency.name}": "${dependency.version}"`
    );

    const devDependencies = devDependenciesRaw.map(
      (dependency) => `"${dependency.name}": "${dependency.version}"`
    );

    const npmScriptsJs = JSON.stringify({
      start: "set NODE_ENV=PRODUCTION & node app.js",
      dev: "npx nodemon app.js",
    });

    const npmScriptsTs = JSON.stringify({
      start: "set NODE_ENV=PRODUCTION & node dist/app.js",
      build: "npx tsc -p .",
      dev: "npx nodemon dist/app.js",
      watch: "npx tsc -w",
    });

    const packageJsonContent = `{
     "name": "${projectName}",
     "version": "1.0.0",
     "description": "",
     "main": ${
       answers.framework === "TypeScript" ? '"dist/app.js"' : '"app.js"'
     },
     "scripts": ${
       answers.framework === "TypeScript" ? npmScriptsTs : npmScriptsJs
     }
     ,
     "keywords": [],
     "author": "",
     "type": "module",
     "license": "ISC",
     "dependencies": {
        ${dependencies.join(",")}
     }, 
        "devDependencies": {
          ${
            answers.framework === "TypeScript"
              ? devDependencies.join(",")
              : devDependencies[0]
          }
        }
      
      }`;

    fs.writeFileSync(`${projectDir}/package.json`, packageJsonContent);

    console.log("\n");
    console.log(
      chalk.bgWhite(
        chalk.black(` 🎉 Project '${projectName}' created successfully! 🎉 `)
      )
    );
    console.log("\n");
    console.log(chalk.magentaBright(chalk.italic("Next Steps:")));
    console.log(chalk.bold(`-> cd ${projectName}`));
    console.log(chalk.bold(`-> npm install \n`));

    console.log(chalk.greenBright(chalk.italic("Start your server: ")));
    if (answers.framework === "TypeScript") {
      console.log(chalk.bold(`1- npm run watch 👀`));
      console.log(chalk.bold(`2- npm run dev 🚀\n`));
    } else {
      console.log(chalk.bold(`1- npm run dev 🚀\n`));
    }
  } catch (error) {
    console.error(error);
  }
}

createApp().catch((error) => {
  console.error(error);
});
