// Transitional adapter for embedded skill revisions still importing the old
// Firebase AI Logic entry point. Remove when every integrated skill uses
// `firebase/ai` directly.
export { getGenerativeModel, SchemaType } from "firebase/ai";
import { getAI, VertexAIBackend } from "firebase/ai";
import { isProductBuild } from "./productRuntime.js";

export function getVertexAI(app) {
  return isProductBuild() ? null : getAI(app, { backend: new VertexAIBackend("us-central1") });
}
