import { writeFile, mkdir } from "fs/promises";

const createGraphQLFile = async (answers, projectDir) => {
  const isPathAlias = answers.usePathAlias;
  const path = isPathAlias ? "@" : "..";
  const isTS = answers.framework === "TypeScript";

  const content = `
import { ApolloServer } from "@apollo/server";
import { graphQLSchema } from "${path}/graphql/schema/schema.js";
import { graphQLResolver } from "${path}/graphql/resolvers/resolvers.js";

export const connectGraphQL = () => {
  const server = new ApolloServer({
    typeDefs: graphQLSchema,
    resolvers: graphQLResolver,
  });

  return server;
};

`;

  if (isTS) {
    await writeFile(`${projectDir}/src/graphql/graphql.ts`, content);
  } else await writeFile(`${projectDir}/graphql/graphql.js`, content);
};

const createGraphQLSchema = async (answers, projectDir) => {
  const isTS = answers.framework === "TypeScript";

  const content = `
export const graphQLSchema = ${"`#graphql"}

type Query {
    hello: String

}

type Mutation {
    addPost(title: String!, content: String!): Post
}

type Post {
    title: String
    content: String
}
${"`"};
    `;

  if (isTS) {
    await writeFile(`${projectDir}/src/graphql/schema/schema.ts`, content);
  } else {
    await writeFile(`${projectDir}/graphql/schema/schema.js`, content);
  }
};

const createGraphQLResolver = async (answers, projectDir) => {
  const isPathAlias = answers.usePathAlias;
  const path = isPathAlias ? "@" : "..";
  const isTS = answers.framework === "TypeScript";

  const content = `
import { helloWord,newPost } from "${path}/controllers/graphql.js";

export const graphQLResolver = {
    Query: {
        hello: helloWord,
    },
    Mutation: {
        addPost:newPost,
    },
};

`;

  if (isTS) {
    await writeFile(
      `${projectDir}/src/graphql/resolvers/resolvers.ts`,
      content
    );
  } else {
    await writeFile(`${projectDir}/graphql/resolvers/resolvers.js`, content);
  }
};

const createGraphQLController = async (answers, projectDir) => {
  const isTS = answers.framework === "TypeScript";

  const contentTs = `
    export const helloWord = () => "Hello, World!";

    type Post = {
        title: string;
        content: string;
    };
    export const newPost = (_:unknown, { title, content }:Post) => {
        return { title, content };
        }
    `;

  const contentJs = `
    export const helloWord = () => "Hello, World!";
    export const newPost = (_,{ title, content }) => {
        return { title, content };
        }
    `;

  if (isTS) {
    await writeFile(`${projectDir}/src/controllers/graphql.ts`, contentTs);
  } else {
    await writeFile(`${projectDir}/controllers/graphql.js`, contentJs);
  }
};

export const createGraphQLService = async (answers, projectDir) => {
  if (!answers.useGraphQL) return;

  const isTS = answers.framework === "TypeScript";

  if (isTS) {
    await mkdir(`${projectDir}/src/graphql`, { recursive: true });
    await mkdir(`${projectDir}/src/graphql/schema`, { recursive: true });
    await mkdir(`${projectDir}/src/graphql/resolvers`, { recursive: true });
  } else {
    await mkdir(`${projectDir}/graphql`, { recursive: true });
    await mkdir(`${projectDir}/graphql/schema`, { recursive: true });
    await mkdir(`${projectDir}/graphql/resolvers`, { recursive: true });
  }
  await createGraphQLFile(answers, projectDir);
  await createGraphQLSchema(answers, projectDir);
  await createGraphQLResolver(answers, projectDir);
  await createGraphQLController(answers, projectDir);
};
