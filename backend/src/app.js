'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')

const options = {}

module.exports = async function (fastify, opts) {
  fastify.register(require('@fastify/swagger'), {})
  fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    })
  fastify.register(require('@fastify/formbody'));

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // cors plugin
  fastify.register(require('@fastify/cors'), {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })

}

module.exports.options = options