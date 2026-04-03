import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

/**
 * Worker handler for WebLLM.
 * This script is bundled and loaded in a background worker.
 */
const handler = new WebWorkerMLCEngineHandler();

onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
