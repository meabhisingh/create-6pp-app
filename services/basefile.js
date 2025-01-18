import { getTsConfigContent } from "./tsconfig.js";
import { writeFile } from "fs/promises";

const getBaseFileContent = (
  importLines = [],
  answers,
  middlewareLines = []
) => {
  const envConfig = answers.useEnvFile
    ? "dotenv.config({path: './.env',});"
    : "";

  const errorHandler = answers.useErrorHandler
    ? "app.use(errorMiddleware);"
    : "";

  const graphQLConfig = answers.useGraphQL
    ? `
const graphqlServer = connectGraphQL();
await graphqlServer.start();
    `
    : "";

  const mongodbConfig = answers.useMongoDB
    ? `
const mongoURI = process.env.MONGO_URI! || 'mongodb://localhost:27017';

connectDB(mongoURI);
  `
    : "\n";

  return `
  ${importLines.join("\n")}
  
  ${envConfig}
  
  export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
  const port = process.env.PORT || 3000;
  ${mongodbConfig}
  const app = express();
  ${graphQLConfig}
                                
  
  ${middlewareLines.join("\n")}
    
  
  app.get('/', (req, res) => {
     res.send('Hello, World!');
  });
  
  // your routes here
  
    
  app.get("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "Page not found",
    });
  });
  
  ${errorHandler}
    
  app.listen(port, () => console.log('Server is working on Port:'+port+' in '+envMode+' Mode.'));
  `;
};

export const createBaseFile = async (
  importLines,
  answers,
  middlewareLines,
  projectDir,
  fileExtension = "js"
) => {
  const baseFileContent = getBaseFileContent(
    importLines,
    answers,
    middlewareLines
  );

  if (answers.framework === "TypeScript") {
    await writeFile(`${projectDir}/src/app.${fileExtension}`, baseFileContent);
    const tsconfigContent = getTsConfigContent(answers.usePathAlias);
    await writeFile(`${projectDir}/tsconfig.json`, tsconfigContent);
  } else {
    await writeFile(`${projectDir}/app.${fileExtension}`, baseFileContent);
  }
};
