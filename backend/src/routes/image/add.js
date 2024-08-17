'use strict';

const fs = require('fs');
const path = require('path');
const fileType = require('file-type'); // Ensure this package is installed

module.exports = async function (fastify, opts) {
  fastify.route({
    url: '/add',
    method: ['POST'],
    schema: {
      summary: 'Add Image',
      description: 'Upload and add a new image for the user',
      tags: ['Image'],
      consumes: ['application/json'],
      body: {
        type: 'object',
        required: ['file', 'username'],
        properties: {
          username: { type: 'string', description: 'Username of the user' },
          file: { type: 'string', format: 'binary', description: 'The image file to upload (base64 encoded)' }
        }
      },
      response: {
        201: {
          description: 'Image added successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        400: {
          description: 'Invalid input or maximum images reached',
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { username, file } = request.body;

      if (!username || !file) {
        reply.code(400).send({
          code: 'INVALID_INPUT',
          message: 'Username or file is missing'
        });
        return;
      }

      const imageDirectory = path.join('/usr/src/app/profile_image', username);

      if (!fs.existsSync(imageDirectory)) {
        fs.mkdirSync(imageDirectory, { recursive: true });
      }

      const userImages = fs.readdirSync(imageDirectory).filter(f => f.startsWith(username));

      // Check if the user already has 5 images
      if (userImages.length >= 5) {
        reply.code(400).send({
          code: 'MAX_IMAGES_REACHED',
          message: 'User already has the maximum of 5 images'
        });
        return;
      }

      // Convert base64 to buffer
      const fileBuffer = Buffer.from(file, 'base64');

      // Detect file type from buffer
      const fileTypeInfo = await fileType.fromBuffer(fileBuffer);

      if (!fileTypeInfo || !['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(fileTypeInfo.mime)) {
        reply.code(400).send({
          code: 'INVALID_FILE_TYPE',
          message: 'Only image files of types JPEG, PNG, GIF, WebP, and BMP are accepted'
        });
        return;
      }

      const imageNumber = userImages.length + 1;
      const imageName = `${username}_${imageNumber}.${fileTypeInfo.ext}`;
      const imagePath = path.join(imageDirectory, imageName);

      try {
        fs.writeFileSync(imagePath, fileBuffer);
        reply.code(201).send({
          success: true,
          message: `Image added successfully as ${imageName}`
        });
      } catch (error) {
        reply.code(500).send({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while saving the image',
          error: error.message
        });
      }
    }
  });
};
