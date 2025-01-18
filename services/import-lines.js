import { writeFile } from "fs/promises";

export const createImportLines = async (answers, projectDir) => {
  const isPathAlias = answers.usePathAlias;

  const importLines = [
    `import express from "express"`,
    `import helmet from "helmet"`,
  ];
  if (answers.useGraphQL) {
    importLines.push(
      isPathAlias
        ? `import { connectGraphQL } from "@/graphql/graphql.js"`
        : `import { connectGraphQL } from "./graphql/graphql.js"`
    );
    importLines.push(
      `import { expressMiddleware } from "@apollo/server/express4";`
    );
  }
  if (answers.useCors) importLines.push(`import cors from 'cors'`);
  if (answers.useErrorHandler)
    importLines.push(
      isPathAlias
        ? `import { errorMiddleware } from "@/middlewares/error.js"`
        : `import {errorMiddleware} from "./middlewares/error.js"`
    );
  if (answers.useMorgan) importLines.push(`import morgan from "morgan"`);
  if (answers.useEnvFile) {
    importLines.push(`import dotenv from "dotenv"`);
    let envFileContent = `PORT=4000`;
    if (answers.useMongoDB)
      envFileContent += `\nMONGO_URI=mongodb://localhost:27017`;
    await writeFile(`${projectDir}/.env`, envFileContent);
  }

  if (answers.useMongoDB)
    importLines.push(
      isPathAlias
        ? `import { connectDB } from "@/lib/db.js"`
        : `import { connectDB } from "./lib/db.js"`
    );
  return importLines;
};

export const createMiddlewareLines = (answers) => {
  const middlewareLines = [
    `
app.use(
  helmet({
    contentSecurityPolicy: envMode !== "DEVELOPMENT",
    crossOriginEmbedderPolicy: envMode !== "DEVELOPMENT",
  })
);
    `,
    `app.use(express.json());`,
    `app.use(express.urlencoded({extended: true}));`,
  ];

  if (answers.useGraphQL)
    middlewareLines.push(
      `app.use("/graphql", expressMiddleware(graphqlServer));`
    );

  if (answers.useCors)
    middlewareLines.push(`app.use(cors({origin:' * ',credentials:true}));`);

  if (answers.useMorgan) middlewareLines.push(`app.use(morgan('dev'))`);

  return middlewareLines;
};
