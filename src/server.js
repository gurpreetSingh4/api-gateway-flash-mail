import dotenv from 'dotenv';
import express from 'express';
import cors from "cors"
import helmet from "helmet"
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { authServiceProxy, mediaServiceProxy, postServiceProxy, searchServiceProxy } from './proxy/proxy-middleware.js';
import { validateToken } from './middleware/authMiddleware.js';

dotenv.config({
    path: './.env'
})


const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(rateLimiter)

app.use((req, res, next)=> {
    logger.info(`Received request: ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
})

app.use("/v1/auth", authServiceProxy)
app.use("/v1/posts", validateToken, postServiceProxy)
app.use("/v1/media", validateToken, mediaServiceProxy)
app.use("/v1/search", validateToken, searchServiceProxy)


app.use(errorHandler)

app.listen(port, () => {
    logger.info(`API Gateway is running on port ${port}`);
    logger.info(
      `Identity service is running on port ${process.env.AUTH_SERVICE_URL}`
    );
    logger.info(
      `Post service is running on port ${process.env.POST_SERVICE_URL}`
    );
    logger.info(
      `Media service is running on port ${process.env.MEDIA_SERVICE_URL}`
    );
    logger.info(
      `Search service is running on port ${process.env.SEARCH_SERVICE_URL}`
    );
  });