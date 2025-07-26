#!/usr/bin/env node

import { Command } from "commander";
import { setRelease } from "./index.js";
import { inquire } from "./inquire.js";

const program = new Command();

program
  .name("proxyload")
  .description("CLI for managing proxy releases")
  .version("1.0.0");

// Set release command
program
  .command("set-release")
  .description("Set a release for a target and environment")
  .requiredOption("-t, --target <target>", "Target name (e.g., vite)")
  .requiredOption(
    "-e, --environment <environment>",
    "Environment name (e.g., production)"
  )
  .requiredOption("-r, --release <release>", "Release name (e.g., latest)")
  .option("-s, --src <src>", "Path to targets file", "./targets.json")
  .option(
    "-d, --dist <dist>",
    "Path to distribution directory",
    "./proxied/dist"
  )
  .action(async (options) => {
    try {
      console.log(
        `Setting release ${options.release} for target ${options.target} in environment ${options.environment}...`
      );

      const result = await setRelease(
        options.src,
        options.dist,
        options.target,
        options.environment,
        options.release
      );

      console.log("✅ Release set successfully!");
      console.log(`Target: ${result.updatedTarget}`);
      console.log(`Environment: ${result.updatedEnvironment}`);
      console.log(`Release: ${result.updatedRelease}`);
    } catch (error) {
      console.error(
        "❌ Error setting release:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Interactive inquire command
program
  .command("inquire")
  .description("Interactive release selection")
  .option(
    "-s, --src <src>",
    "Path to targets directory",
    `${process.cwd()}/src`
  )
  .option(
    "-d, --dist <dist>",
    "Path to distribution directory",
    `${process.cwd()}/dist`
  )
  .action(async (options) => {
    try {
      await inquire(options.src, options.dist);
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

program.parse();
