'use strict';

module.exports = async function (fastify, opts) {
  fastify.route({
    url: '/profile',
    method: ['POST'],
    schema: {
      summary: 'Fill user profile',
      description: 'Create/Update the profile of the user with the provided username, gender, sexuality, biography, and interest',
      tags: ['User'],
      body: {
        type: 'object',
        required: ['username', 'gender', 'biography', 'sexuality', 'interests'],
        properties: {
          username: { type: 'string', description: 'Username of the user' },
          gender: { type: 'string', description: 'User gender' },
          sexuality: { type: 'string', description: 'User sexuality' },
          biography: { type: 'string', description: 'User biography' },
          interests: { type: 'string', description: 'User list of interests' }
        }
      },
      response: {
        201: {
          description: 'Profile filled successfully',
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            gender: { type: 'string' },
            sexuality: { type: 'string' },
            biography: { type: 'string' },
            interests: { type: 'string' }
          }
        },
        400: {
          description: 'Invalid input',
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { username, gender, sexuality, biography, interests } = request.body;
      const connection = await fastify.mysql.getConnection();

      try {
        // simplify below logic to find user and insert more info
        const [user] = await connection.query(
          'SELECT id FROM user WHERE username = ?'
        , [username]);

        if (user.length === 0) {
          reply.code(400).send({
            code: 'USER_NOT_FOUND',
            message: 'Username does not exist'
          });
          return;
        }

        await connection.query(
          'UPDATE user SET gender = ?, sexuality = ?, biography = ?, interests = ? WHERE username = ?',
          [gender, sexuality, biography, interests, username]
        );
        fastify.log.info("Profile updated successfully");

        reply.code(201).send({
          insertId: user[0].id,
          username: username,
          gender: gender,
          sexuality: sexuality,
          biography: biography,
          interests: interests
        });
      } catch (error) {
        console.error(error);
        reply.code(500).send({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while filling the profile'
        });
      } finally {
        if (connection) connection.release();
      }
    }
  });
};

