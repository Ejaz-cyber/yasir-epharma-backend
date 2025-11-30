import "express";
import { JwtUserPayload } from ".";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtUserPayload; 
  }
}
