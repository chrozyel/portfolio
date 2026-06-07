const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT) || 3000;
const publicDir = __dirname;

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function resolveFile(urlPath) {
    const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
    const requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
    const filePath = path.normalize(path.join(publicDir, requestedPath));
    const relativePath = path.relative(publicDir, filePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return null;
    }

    return filePath;
}

const server = http.createServer((req, res) => {
    const filePath = resolveFile(req.url || "/");

    if (!filePath) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            fs.readFile(path.join(publicDir, "index.html"), (fallbackError, fallbackContent) => {
                if (fallbackError) {
                    res.writeHead(404);
                    res.end("Not found");
                    return;
                }

                res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
                res.end(fallbackContent);
            });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
        res.end(content);
    });
});

server.listen(port, () => {
    console.log(`Portfolio running on port ${port}`);
});
