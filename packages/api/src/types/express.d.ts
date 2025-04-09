import 'express';
import type { Session } from 'better-auth'; // replace with actual session type if needed

declare module 'express' {
  interface Request {
    session?: {
      session: Session,
      user: User
    };
  }
}