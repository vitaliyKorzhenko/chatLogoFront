import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import fs from "fs";
import axios from "axios";
import path from "path";
import { Buffer } from 'buffer';


 class DigitalOceanHelper {
  private static s3Client: S3Client;

  private static region = "sfo3"; // Example: "nyc3"
  private static endpoint = "https://sfo3.digitaloceanspaces.com"; // Example: "https://nyc3.digitaloceanspaces.com"


  private static accessKeyId = "DO00T9CHH9PEB22LLMFB"; // Replace with your Access Key ID
  private static secretAccessKey = "xDYjA0RJiOq7R8dKmABLp1bNFkPs6fLdtPJuVT9j8io"; // Replace with your Secret Access Key
  private static bucketName = "govorikavideo";
  private static folder = "chatLogo";

  /**
   * Initialize the S3 client for DigitalOcean Spaces.
   * @param region The region of the DigitalOcean Space (e.g., "nyc3").
   * @param endpoint The endpoint of the DigitalOcean Space (e.g., "https://nyc3.digitaloceanspaces.com").
   * @param accessKeyId Your access key ID for the Space.
   * @param secretAccessKey Your secret access key for the Space.
   * @returns A string indicating whether the initialization was successful.
   */
  static initialize(region: string, endpoint: string, accessKeyId: string, secretAccessKey: string): string {
    try {
      this.s3Client = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      console.warn('S3 Client initialized successfully.');
      return "S3 Client initialized successfully.";
    } catch (error) {
      console.error("Failed to initialize S3 client:", error);
      return "Failed to initialize S3 client.";
    }
  }

  /**
   * Upload a file to the specified bucket and folder.
   * @param bucketName The name of the bucket.
   * @param folder The folder path inside the bucket.
   * @param filePath The local file path to upload.
   * @returns A promise resolving to the public URL of the uploaded file.
   */
  static async uploadFile(bucketName: string, folder: string, filePath: string): Promise<string> {
    try {
        // Create the test file if it doesn't exist
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "This is a test file created for upload.");
            console.log(`Test file created at: ${filePath}`);
        }
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    
    // Добавляем уникальный идентификатор с timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    const key = `${folder}/${uniqueFileName}`

      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: fileStream,
        ACL: ObjectCannedACL.public_read, // Use the enum instead of a string

      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      const fileUrl = `https://${bucketName}.${this.s3Client.config.endpoint!.name}/${key}`;
      console.log('fileUrl', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file.");
    }
  }


  static async uploadFileToSpaces(file: File, bucketName: string, folder: string): Promise<string> {
    try {
      // Инициализируем клиент, если он ещё не был создан
      if (!this.s3Client) {
        this.initialize(this.region, this.endpoint, this.accessKeyId, this.secretAccessKey);
      }
  
      // Добавляем уникальный идентификатор с timestamp
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.name}`;
      
      // Определяем имя файла с уникальным идентификатором
      const key = `${folder}/${uniqueFileName}`;
  
      // Подготавливаем параметры для загрузки
      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: file, // Передаём файл напрямую
        ACL: ObjectCannedACL.public_read, // Убедимся, что enum использует правильный регистр
        ContentLength: file.size, // Размер файла
        ContentType: file.type || 'application/octet-stream', // Тип содержимого
      };
  
      // Выполняем загрузку
      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);
  
      const fileUrl = `https://${bucketName}.sfo3.digitaloceanspaces.com/${key}`;
      console.log('File uploaded successfully:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file.');
    }
  }
  
  
  static async uploadFileElementToSpaces(file: File, bucketName: string, folder: string): Promise<string> {
    try {
      if (!this.s3Client) {
        this.initialize(this.region, this.endpoint, this.accessKeyId, this.secretAccessKey);
      }
  
      // Функция для очистки имени файла
      const sanitizeFileName = (fileName: string): string => {
        return fileName
          .trim()
          .replace(/\s+/g, '_') // Заменяем пробелы на подчёркивания
          .replace(/[^a-zA-Z0-9_\-.]/g, ''); // Удаляем недопустимые символы
      };
  
            // Очищаем имя файла
      console.log('Original filename:', file.name);
      const sanitizedFileName = sanitizeFileName(file.name);
      console.log('Sanitized filename:', sanitizedFileName);

      // Добавляем уникальный идентификатор с timestamp
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
      console.log('Final filename:', uniqueFileName);

      // Преобразуем File в Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Формируем ключ с уникальным именем файла
      const key = `${folder}/${uniqueFileName}`;
  
      // Параметры для загрузки
      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: buffer, // Передаём Buffer
        ACL: ObjectCannedACL.public_read,
        ContentType: file.type || 'application/octet-stream', // MIME-тип файла
        ContentLength: buffer.length, // Размер файла
      };
  
      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);
  
      // Генерируем URL файла
      const fileUrl = `https://${bucketName}.sfo3.digitaloceanspaces.com/${key}`;
      console.log('File uploaded successfully:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file.');
    }
  }
  
  

}

export default DigitalOceanHelper;


// Instructions:
// 1. Install required packages: `npm install @aws-sdk/client-s3 fs path`
// 2. Replace placeholder values (region, endpoint, keys, bucketName, folder, filePath) with your DigitalOcean Spaces configuration.
// 3. Run the script using `node <file-name>.ts` or `ts-node <file-name>.ts` if using TypeScript directly.
