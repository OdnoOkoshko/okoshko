import express, { type Request, Response, NextFunction } from "express";
import routes from "./routes.js";
import { createServer } from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Подключение маршрутов API
app.use(routes);

// Обслуживание собранного TypeScript приложения
app.use(express.static(join(__dirname, '../dist/public')));

// SPA fallback - все маршруты ведут к React приложению
app.get('*', (req: Request, res: Response) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(join(__dirname, '../dist/public/index.html'));
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Добавляем MIME типы для TypeScript модулей
express.static.mime.define({'application/javascript': ['ts', 'tsx']});

const server = createServer(app);
const port = parseInt(process.env.PORT || '80', 10);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
