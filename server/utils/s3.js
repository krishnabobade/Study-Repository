const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../config/logger');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'studyrepo-storage-prod';

/**
 * Uploads a file stream/buffer to S3
 * @param {Buffer} fileBuffer - The file data
 * @param {string} fileName - Destination file path in S3
 * @param {string} mimeType - The file's MIME type
 * @returns {Promise<string>} The uploaded file's key
 */
exports.uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType,
      // Consider adding server-side encryption for security
      // ServerSideEncryption: 'AES256'
    });

    await s3Client.send(command);
    logger.info(`✅ Successfully uploaded ${fileName} to S3 bucket ${BUCKET_NAME}`);
    return fileName;
  } catch (error) {
    logger.error(`❌ S3 Upload Error for ${fileName}:`, error);
    throw error;
  }
};

/**
 * Generates a pre-signed URL for secure, temporary download access
 * @param {string} fileKey - The S3 object key
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
exports.getPresignedDownloadUrl = async (fileKey, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    // Create a presigned URL that expires in `expiresIn` seconds
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error(`❌ S3 Presign URL Error for ${fileKey}:`, error);
    throw error;
  }
};

/**
 * Deletes an object from S3
 * @param {string} fileKey - The S3 object key to delete
 */
exports.deleteFromS3 = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    logger.info(`🗑️ Successfully deleted ${fileKey} from S3`);
  } catch (error) {
    logger.error(`❌ S3 Delete Error for ${fileKey}:`, error);
    throw error;
  }
};
