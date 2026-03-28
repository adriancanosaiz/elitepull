import { z } from "zod";

const uuidLikePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createUuidLikeSchema(message: string) {
  return z.string().trim().regex(uuidLikePattern, message);
}

