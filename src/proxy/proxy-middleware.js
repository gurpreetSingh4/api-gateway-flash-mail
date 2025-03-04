import proxy from "express-http-proxy"
import { logger } from "../utils/logger.js"

const commonProxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api");
      },
      proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err.message}`);
        res.status(500).json({
          message: `Internal server error`,
          error: err.message,
        });
      },
}

const authServiceProxyOptions = {
    ...commonProxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
          `Response received from Identity service: ${proxyRes.statusCode}`
        );
  
        return proxyResData;
      },
}

const postServiceProxyOptions = {
    ...commonProxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
  
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
          `Response received from Post service: ${proxyRes.statusCode}`
        );
        return proxyResData;
      },
}

const mediaServiceProxyOptions = {
    ...commonProxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
          proxyReqOpts.headers["Content-Type"] = "application/json";
        }
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
          `Response received from media service: ${proxyRes.statusCode}`
        );
        return proxyResData;
      },
      parseReqBody: false,
}

const searchServiceProxyOptions = {
    ...commonProxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
          `Response received from Search service: ${proxyRes.statusCode}`
        );
        return proxyResData;
      },
}
console.log(process.env.AUTH_SERVICE_URL)
console.log(process.env.POST_SERVICE_URL)

export const authServiceProxy = proxy(process.env.AUTH_SERVICE_URL || "http://localhost:3001", authServiceProxyOptions)
export const postServiceProxy = proxy(process.env.POST_SERVICE_URL || "http://localhost:3002", postServiceProxyOptions)
export const mediaServiceProxy = proxy(process.env.MEDIA_SERVICE_URL || "http://localhost:3003", mediaServiceProxyOptions)
export const searchServiceProxy = proxy(process.env.SEARCH_SERVICE_URL || "http://localhost:3004", searchServiceProxyOptions)