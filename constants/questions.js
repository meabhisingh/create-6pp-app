export const questions = [
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
    name: "useMongoDB",
    message: "Do you want to use MongoDB?",
    default: false,
  },
  {
    type: "confirm",
    name: "useGraphQL",
    message: "Do you want to use GraphQL?",
    default: false,
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
    default: true,
  },
  {
    type: "confirm",
    name: "useEsLint",
    message: "Do you want to use ESLint for code linting?",
    default: true,
  },
  {
    type: "confirm",
    name: "usePathAlias",
    message: "Do you want to set @/ as src path alias?",
    default: true,
    when: (answers) => answers.framework === "TypeScript",
  },
  {
    type: "confirm",
    name: "useAutoInstall",
    message: "Do you want to auto-install dependencies?",
    default: true,
  },
];
