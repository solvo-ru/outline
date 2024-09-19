import { existsSync, mkdirSync } from "fs";
import env from "@server/env";
import Logger from "@server/logging/Logger";
import {
  PluginManager,
  PluginPriority,
  Hook,
} from "@server/utils/PluginManager";
import router from "./api/files";
import structurizrRouter from "./api/structurizr";

if (env.STRUCTURIZR_S3_URL) {
  PluginManager.add([
    {
      name: "Structurizr data",
      description: "Plugin for accessing Structurizr files",
      type: Hook.API,
      value: structurizrRouter,
      priority: PluginPriority.Normal,
    },
  ]);
}
if (env.FILE_STORAGE === "local") {
  const rootDir = env.FILE_STORAGE_LOCAL_ROOT_DIR;
  try {
    if (!existsSync(rootDir)) {
      mkdirSync(rootDir, { recursive: true });
      Logger.debug("utils", `Created ${rootDir} for local storage`);
    }
  } catch (err) {
    Logger.fatal(
      `Failed to create directory for local file storage at ${env.FILE_STORAGE_LOCAL_ROOT_DIR}`,
      err
    );
  }
}

const enabled = !!(
  env.FILE_STORAGE_UPLOAD_MAX_SIZE &&
  env.FILE_STORAGE_LOCAL_ROOT_DIR &&
  env.FILE_STORAGE === "local"
);

if (enabled) {
  PluginManager.add([
    {
      name: "Local file storage",
      description: "Plugin for storing files on the local file system",
      type: Hook.API,
      value: router,
      priority: PluginPriority.Normal,
    },
  ]);
}
