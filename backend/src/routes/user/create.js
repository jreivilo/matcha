'use strict'

const argon2 = require('argon2');
const { Recipient, Sender, EmailParams, MailerSend } = require("mailersend");
const { v4: uuidv4 } = require('uuid');

module.exports = async function (fastify, opts) {
  fastify.route({
    url: '/create-user',
    method: ['POST'],
    schema: {
      summary: 'Create a new user',
      description: 'Creates a new user with the provided email, username, password, first_name, and last_name',
      tags: ['User'],
      body: {
        type: 'object',
        required: ['email', 'username', 'password', 'first_name', 'last_name'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          password: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'User created successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            username: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            success: { type: 'boolean' }
          }
        },
        400: {
          description: 'Bad request',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { email, username, password, first_name, last_name } = request.body;
      let connection;

      try {
        connection = await fastify.mysql.getConnection();

        // Check if the email or username already exists
        const [existingUsers] = await connection.query(
          'SELECT COUNT(*) AS count FROM user WHERE email = ? OR username = ?',
          [email, username]
        );

        if (existingUsers[0].count > 0) {
          return reply.code(400).send({
            success: false,
            message: 'Email or Username already exists'
          });
        }

        // Hash the password
        const hashedPassword = await argon2.hash(password + process.env.DATABASE_SALT);
      
        // Insert the new user into the database
        // const [result] = await connection.query(
        //   'INSERT INTO user (email, password, username, first_name, last_name, profile_completed, active, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        //   [email, hashedPassword, username, first_name, last_name, false, true, false]
        // );
        const [result] = await connection.query(
          'INSERT INTO user (email, username, password, first_name, last_name, active, verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [email, username, hashedPassword, first_name, last_name, true, false]
        )
        console.log("User inserted in db");
    
        // Create verification record
        const verificationId = uuidv4();
        await connection.query(
          'INSERT INTO user_verification (user_id, token) VALUES (?, ?)',
          [result.insertId, verificationId]
        );
        console.log("Verification record inserted in db");

        // Send verification email
        const mailerSend = new MailerSend({
          apiKey: process.env.MAILERSEND_API_KEY
        });

        const sentFrom = new Sender("MS_TIFpHj@trial-o65qngkj96wlwr12.mlsender.net", "Matcha");
        const recipients = [new Recipient(email, `${first_name} ${last_name}`)];

        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setReplyTo(sentFrom)
          .setSubject("Verify your account")
          .setHtml(`Click <a href='http://localhost:3000/verify-account/${verificationId}'>here</a> to verify your account`)
          .setText("This is the text content");
        
        await mailerSend.email.send(emailParams);
        console.log("Email sent");

        return reply.code(201).send({
          success: true,
          id: result.insertId,
          email,
          username,
          first_name,
          last_name
        });

      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'An error occurred while creating the user'
        });
      } finally {
        if (connection) connection.release();
      }
    }
  });
}