export declare function createWebServer(): Promise<{
    app: import("express-serve-static-core").Express;
    sendSseUpdate: () => void;
    startServer(): Promise<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>;
}>;
