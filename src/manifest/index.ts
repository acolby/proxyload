import fs from "fs/promises";
import path from "path";
import type { ReleasesData, TargetsFile } from "../types";

export async function getReleases(dist: string) {
  const releases = JSON.parse(
    (await fs.readFile(dist + "/releases.json", "utf-8")) || "{}"
  ) as ReleasesData;
  return releases;
}

export async function getTargets(src: string) {
  const targetPath = path.join(src, "targets.json");
  const targetFile = JSON.parse(
    (await fs.readFile(targetPath, "utf-8")) || "{}"
  ) as TargetsFile;
  return targetFile;
}

export async function getCurrent(dist: string, targetName: string) {
  const manifestPath = path.join(dist, "manifests", targetName, "current.json");
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
    return manifest;
  } catch (error) {
    // If file doesn't exist or is invalid JSON, return empty object
    return {};
  }
}

export async function getHistory(dist: string, targetName: string) {
  const manifestPath = path.join(dist, "manifests", targetName, "history.json");
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
    return manifest;
  } catch (error) {
    // If file doesn't exist or is invalid JSON, return empty object
    return {};
  }
}

async function setRelease(
  src: string,
  dist: string,
  targetName: string,
  environment: string,
  release: string
) {
  const targetFile = await getTargets(src);
  const releases = await getReleases(dist);

  const target = targetFile[targetName];

  if (!target) {
    throw new Error(`Target ${targetName} not found in ${src}`);
  }

  // Check if the environment exists for this target
  if (!target.environments.includes(environment)) {
    throw new Error(
      `Environment ${environment} not found for target ${targetName}`
    );
  }

  // Check if the release exists
  if (!releases.releases[release]) {
    throw new Error(`Release ${release} not found in releases`);
  }

  // Update the current.json file for the target
  const targetManifestPath = path.join(
    dist,
    "manifests",
    targetName,
    "current.json"
  );

  // Get current data, create empty object if file doesn't exist
  let currentData: Record<string, any> = {};
  try {
    currentData = JSON.parse(await fs.readFile(targetManifestPath, "utf-8"));
  } catch (error) {
    // File doesn't exist or is invalid JSON, start with empty object
    currentData = {};
  }

  // Update the current release for the environment
  currentData[environment] = {
    current: release,
    updatedAt: new Date().toISOString(),
  };

  // Write the updated current.json
  await fs.mkdir(path.dirname(targetManifestPath), { recursive: true });
  await fs.writeFile(targetManifestPath, JSON.stringify(currentData, null, 2));

  // Update the history.json file
  const historyPath = path.join(dist, "manifests", targetName, "history.json");

  // Get history data, create empty object if file doesn't exist
  let historyData: Record<string, any> = {};
  try {
    historyData = JSON.parse(await fs.readFile(historyPath, "utf-8"));
  } catch (error) {
    // File doesn't exist or is invalid JSON, start with empty object
    historyData = {};
  }

  if (!historyData[environment]) {
    historyData[environment] = { history: [] };
  }

  // Add the new release to history
  historyData[environment].history.unshift({
    name: release,
    updatedAt: new Date().toISOString(),
  });

  // Keep only the last 30 entries in history
  historyData[environment].history = historyData[environment].history.slice(
    0,
    30
  );

  // Write the updated history.json
  await fs.mkdir(path.dirname(historyPath), { recursive: true });
  await fs.writeFile(historyPath, JSON.stringify(historyData, null, 2));

  return {
    targetFile,
    releases,
    updatedTarget: targetName,
    updatedEnvironment: environment,
    updatedRelease: release,
  };
}

export { setRelease };
