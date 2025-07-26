#!/usr/bin/env node

import inquirer from "inquirer";
import { setRelease, getReleases, getTargets } from "./index.js";

export async function inquire(src: string, dist: string) {
  try {
    console.log(`Using targets from: ${src}`);
    console.log(`Using releases from: ${dist}`);
    console.log("");

    // Get available targets
    const targets = await getTargets(src);
    const targetNames = Object.keys(targets);

    if (targetNames.length === 0) {
      console.error(`❌ No targets found in ${src}`);
      process.exit(1);
    }

    // Get available releases
    const releases = await getReleases(dist);
    const releaseNames = Object.keys(releases.releases);

    if (releaseNames.length === 0) {
      console.error(`❌ No releases found in ${dist}/releases.json`);
      process.exit(1);
    }

    // Prompt for target selection
    const { selectedTarget } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedTarget",
        message: "Select a target:",
        choices: targetNames,
      },
    ]);

    const target = targets[selectedTarget];
    const environments = target.environments;

    if (environments.length === 0) {
      console.error(`❌ No environments found for target ${selectedTarget}`);
      process.exit(1);
    }

    // Prompt for environment selection
    const { selectedEnvironment } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedEnvironment",
        message: "Select an environment:",
        choices: environments,
      },
    ]);

    // Prompt for release selection
    const { selectedRelease } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedRelease",
        message: "Select a release:",
        choices: releaseNames,
      },
    ]);

    // Confirm the selection
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Set release "${selectedRelease}" for target "${selectedTarget}" in environment "${selectedEnvironment}"?`,
        default: true,
      },
    ]);

    if (!confirm) {
      console.log("Operation cancelled.");
      return;
    }

    // Set the release
    console.log(
      `Setting release ${selectedRelease} for target ${selectedTarget} in environment ${selectedEnvironment}...`
    );

    const result = await setRelease(
      src,
      dist,
      selectedTarget,
      selectedEnvironment,
      selectedRelease
    );

    console.log("✅ Release set successfully!");
    console.log(`Target: ${result.updatedTarget}`);
    console.log(`Environment: ${result.updatedEnvironment}`);
    console.log(`Release: ${result.updatedRelease}`);
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
