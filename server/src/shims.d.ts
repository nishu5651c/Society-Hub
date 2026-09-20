declare const process: { env: Record<string, string | undefined> };
declare const console: { log(...args: unknown[]): void; error(...args: unknown[]): void };

declare module "express" {
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
  export type RequestHandler = any;
  export type ErrorRequestHandler = any;
  export function Router(): any;
  const express: any;
  export default express;
}

declare module "cors" { const cors: (...args: any[]) => any; export default cors; }
declare module "helmet" { const helmet: (...args: any[]) => any; export default helmet; }
