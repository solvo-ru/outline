import auth from "@server/middlewares/authentication";
import validate from "@server/middlewares/validate";
import * as T from "./schema";
import { APIContext } from "@server/types";
import Router from "koa-router";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import env from "@server/env";
import Logger from "@server/logging/Logger";
import { diagramToSvg } from "@shared/editor/extensions/kroki/utils";
import { Readable } from "stream";

const structurizrRouter = new Router();
const client = new S3Client({
  bucketEndpoint: true,
  forcePathStyle: false,
  region: "eu-east-1",
  endpoint: env.STRUCTURIZR_S3_URL,
  credentials: {
    accessKeyId: env.STRUCTURIZR_S3_ACCESS_KEY as string,
    secretAccessKey: env.STRUCTURIZR_S3_SECRET_KEY as string,
  },
});

structurizrRouter.post(
  "structurizr.workspace",
  auth({ optional: true }),
  validate(T.StructurizrWorkspaceSchema),
  async (ctx: APIContext<T.StructurizrWorkspaceReq>) => {
    const id = ctx.input.body.id;
    ctx.body = await getWorkspace(id);
  }
);

structurizrRouter.post(
  "structurizr.view",
  auth({ optional: true }),
  validate(T.StructurizrViewSchema),
  async (ctx: APIContext<T.StructurizrViewReq>) => {
    const workspaceId = ctx.input.body.workspaceId;
    const viewKey = ctx.input.body.viewKey;
    Logger.silly("http", `workspaceId is ${workspaceId}`);

    const workspaceJson = await getWorkspace(workspaceId);
    Logger.silly("http", workspaceJson);
    ctx.body = await diagramToSvg<"structurizr">("structurizr", workspaceJson, {
      "view-key": viewKey,
    });
  }
);

async function getWorkspace(workspaceId: string | number): Promise<string> {
  const filePath = `workspaces/${workspaceId}/workspace.json`;
  const command = new GetObjectCommand({
    Bucket: env.STRUCTURIZR_S3_URL as string,
    Key: filePath,
  });
  Logger.silly("commands", command.input.Bucket + "/" + command.input.Key);

  Logger.silly("database", JSON.stringify(client.config));
  try {
    const { Body } = await client.send(command);
    const fileContent = (await streamToString(Body as Readable)) as String ?? "";
    console.log(fileContent);
    return fileContent.toString();
  } catch (err) {
    Logger.error("Error getting file from Structurizr S3 ", err, {
      filePath,
    });
    throw err;
  }
}

const streamToString = (stream: Readable) =>
  new Promise((resolve, reject) => {
    // @ts-ignore
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));

    stream.on("end", () =>
      // @ts-ignore
      resolve(Buffer.concat(chunks).toString("utf-8"))
    );
    stream.on("error", reject);
  });
export default structurizrRouter;
