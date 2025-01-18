import { writeFile } from "fs/promises";

const createMongoDB = async (answers, projectDir, projectName) => {
  if (!answers.useMongoDB) return;

  const isTS = answers.framework === "TypeScript";
  const mongoDBContent = `    
  import mongoose from "mongoose";
  
  export const connectDB = (uri: string) =>
    mongoose
      .connect(uri, { dbName: "${projectName}" })
      .then((c) => {
        console.log(${"`Connected with ${c.connection.name}`"});
      })
      .catch((e) => console.log(e));
  
  `;

  if (isTS) await writeFile(`${projectDir}/src/lib/db.ts`, mongoDBContent);
  else await writeFile(`${projectDir}/lib/db.js`, mongoDBContent);
};

export const createMongooseModel = async (answers, projectDir) => {
  const isTS = answers.framework === "TypeScript";
  if (!answers.useMongoDB) return;

  const modelContent = `
import mongoose from "mongoose";

${
  isTS
    ? `
interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

type IUserModel = mongoose.Model<IUser> & {};
`
    : ""
}

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

${
  isTS
    ? 'export const User = mongoose.model<IUser, IUserModel>("User", schema);'
    : 'export const User = mongoose.model("User", schema);'
}
`;

  const path = isTS
    ? `${projectDir}/src/models/user.ts`
    : `${projectDir}/models/user.js`;
  await writeFile(path, modelContent);
};

export const createMongoDBService = async (answers, projectDir) => {
  if (!answers.useMongoDB) return;

  await createMongoDB(answers, projectDir);
  await createMongooseModel(answers, projectDir);
};
