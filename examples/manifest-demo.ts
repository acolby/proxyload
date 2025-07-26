import { ManifestUtil } from "../src/manifest/index.js";
import { writeFile } from "fs/promises";

async function demo() {
  console.log("🎯 Manifest Utility Demo with Static Targets\n");

  // Create a sample targets.json file
  const sampleTargets = {
    "web-app": {
      name: "web-app",
      environments: ["production", "staging", "development"],
    },
    "api-service": {
      name: "api-service",
      environments: ["production", "staging"],
    },
    "mobile-app": {
      name: "mobile-app",
      environments: ["production", "beta"],
    },
  };

  // Write the targets file
  await writeFile(
    "./examples/targets.json",
    JSON.stringify(sampleTargets, null, 2)
  );
  console.log("✅ Created sample targets.json file\n");

  // Create a manifest utility instance
  const manifestUtil = new ManifestUtil({
    manifestsDir: "./examples/manifests",
    targetsFile: "./examples/targets.json",
  });

  // Load targets and show them
  console.log("1. Available targets from targets.json:");
  const targets = await manifestUtil.getTargets();
  targets.forEach((target) => {
    console.log(`   📱 ${target.name}: ${target.environments.join(", ")}`);
  });
  console.log("");

  // Set some releases for existing targets
  console.log("2. Setting releases for targets...");

  await manifestUtil.setRelease("web-app", "production", "v2.1.0");
  await manifestUtil.setRelease("web-app", "staging", "v2.1.1-rc");
  await manifestUtil.setRelease("web-app", "development", "latest");

  await manifestUtil.setRelease("api-service", "production", "v1.5.2");
  await manifestUtil.setRelease("api-service", "staging", "v1.5.3-beta");

  await manifestUtil.setRelease("mobile-app", "production", "v3.0.0");
  await manifestUtil.setRelease("mobile-app", "beta", "v3.1.0-alpha");

  console.log("✅ Set releases for all targets!\n");

  // Show current status
  console.log("3. Current release status:");
  for (const target of targets) {
    console.log(`\n📱 ${target.name}:`);
    for (const env of target.environments) {
      const currentRelease = await manifestUtil.getCurrentRelease(
        target.name,
        env
      );
      console.log(`   ${env}: ${currentRelease}`);
    }
  }

  console.log("\n🎉 Demo completed!");
  console.log("\n💡 Now you can try the interactive CLI:");
  console.log("   npm run manifest -- --targets ./examples/targets.json");
  console.log("\n   Or run specific commands:");
  console.log(
    "   npm run manifest interactive -- --targets ./examples/targets.json"
  );
  console.log("   npm run manifest quick -- --targets ./examples/targets.json");
  console.log(
    "   npm run manifest list-targets -- --targets ./examples/targets.json"
  );
}

demo().catch(console.error);
