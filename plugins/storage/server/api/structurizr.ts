import auth from "@server/middlewares/authentication";
import validate from "@server/middlewares/validate";
import * as T from "./schema";
import { APIContext } from "@server/types";
import Router from "koa-router";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import env from "@server/env";
import Logger from "@server/logging/Logger";
import { diagramToSvg } from "@shared/editor/extensions/kroki/utils";

const structurizrRouter = new Router();

structurizrRouter.post(
    "structurizr.workspace",
    auth({ optional: true }),
    validate(T.StructurizrWorkspaceSchema),
    async (ctx: APIContext<T.StructurizrWorkspaceReq>) => {
        const  id = ctx.input.body.id;
        ctx.body  = await getWorkspace(id);
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
        console.log( `workspaceId is ${workspaceId}`);

      const workspaceJson = await getWorkspace(workspaceId);
      ctx.body = await diagramToSvg<"structurizr">(
          "structurizr",
          workspaceJson,
          {
            "view-key": viewKey,
          }
      );
    }
);

async function getWorkspace(workspaceId: string | number): Promise<string> {
  const filePath = `workspaces/${workspaceId}/workspace.json`;
  const command = new GetObjectCommand({
    Bucket: env.STRUCTURIZR_S3_URL as string,
    Key: filePath,
  });
    Logger.silly("commands", command.input.Bucket+"/"+command.input.Key);
    console.log(command.input.Bucket+"/"+command.input.Key);

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
    Logger.silly("database", JSON.stringify(client.config));
    console.log(JSON.stringify(client.config));
  try {
    const response = await client.send(command);
    const fileContent = response.Body?.toString() ?? "";
    if (fileContent == "") throw new Error("Empty file");
    Logger.debug("http", fileContent as string);
      console.log(fileContent as string);
    return fileContent;
  } catch (err) {
    Logger.error("Error getting file from Structurizr S3 ", err, {
      filePath,
    });

    throw err;
  }
}

export default structurizrRouter;
