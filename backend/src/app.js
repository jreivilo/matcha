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
    origin: 'http://localhost:4000',
    // only accept req from localhost:4000 (our frontend). if you set it to through it reflects any origin, allowing forgery
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
    credentials: true,
    optionsSuccessStatus: 200,
  });
  
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}

module.exports.options = options