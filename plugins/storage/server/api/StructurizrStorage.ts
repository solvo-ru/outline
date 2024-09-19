import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from 'stream';

// Создаем клиента
const s3 = new S3Client({ region: "your-region" });

async function getFileContent(bucketName, key) {
  try {
    // Команда для получения объекта
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Выполняем команду
    const { Body } = await s3.send(command);

    // Читаем поток данных и конвертируем его в строку
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        stream.on("error", reject);
      });

    const fileContent = await streamToString(Body);

    console.log(fileContent); // Тут содержимое файла

    return fileContent;
  } catch (error) {
    console.error("Error getting file from S3: ", error);
  }
}

getFileContent("your-bucket-nae", "path/to/your/file.txt");
