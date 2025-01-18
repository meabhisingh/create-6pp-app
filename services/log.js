import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import ora from "ora";

const asyncExec = promisify(exec);

const installDependencies = async (projectDir) => {
  // Change directory
  process.chdir(projectDir);

  // Install dependencies with spinner
  const spinner = ora("Installing dependencies...").start();
  try {
    await asyncExec("npm install");
    spinner.succeed("Dependencies installed successfully!");
  } catch (error) {
    spinner.fail("Failed to install dependencies");
    throw error;
  }

  // Open VS Code
  console.log(chalk.magentaBright(chalk.italic("Opening VS Code... 👨🏻‍💻")));
  await asyncExec("code .");
};

export const logMessages = async (answers, projectName, projectDir) => {
  const isAutoInstall = answers.useAutoInstall;

  console.log("\n");
  console.log(
    chalk.bgWhite(
      chalk.black(` 🎉 Project '${projectName}' created successfully! 🎉 `)
    )
  );
  console.log("\n");
  if (isAutoInstall) {
    await installDependencies(projectDir);
    console.log("\n");
    console.log(chalk.greenBright(chalk.italic("Start your server: ")));
    console.log(chalk.bold(`npm run dev 🚀\n`));
  } else {
    console.log(chalk.magentaBright(chalk.italic("Next Steps:")));
    console.log(chalk.bold(`-> cd ${projectName}`));
    console.log(chalk.bold(`-> npm install \n`));
    console.log(chalk.greenBright(chalk.italic("Start your server: ")));
    console.log(chalk.bold(`npm run dev 🚀\n`));
  }
};
