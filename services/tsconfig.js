export const getTsConfigContent = (isPathAlias = true) =>
  `
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    ${isPathAlias ? `"baseUrl": "./",` : ""}
    ${
      isPathAlias
        ? `"paths": {
        "@/*": ["src/*"]
    },`
        : ""
    }
    "typeRoots": ["./src/types"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"],
  "exclude": ["node_modules", "dist"]
}
`;
