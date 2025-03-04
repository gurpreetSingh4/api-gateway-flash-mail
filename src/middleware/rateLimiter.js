import {rateLimit} from "express-rate-limit"
import {RedisStore} from "rate-limit-redis"
import { logger } from "../utils/logger.js"
import { redisClient } from "../config/redis-client.js"

export const rateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) =>{
        logger.warn(`Too many requests from IP: ${req.ip}`)
        res.status(429).json({
            success: false,
            message: 'Too many requests'
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args) 
    })
})

