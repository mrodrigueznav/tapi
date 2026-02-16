import { buildPrefillFromXml } from "./application/useCases/PrefillFromXml.usecase.js";
import { CfdiStrategy } from "./infrastructure/xml/strategies/CfdiStrategy.js";
import { UnknownStrategy } from "./infrastructure/xml/strategies/UnknownStrategy.js";
import { createPrefillController } from "./presentation/prefill.controller.js";
import { createPrefillRoutes } from "./presentation/prefill.routes.js";

export function createPrefillModule() {
  const strategies = [CfdiStrategy, UnknownStrategy];
  const prefillFromXml = buildPrefillFromXml(strategies);
  const controller = createPrefillController(prefillFromXml);
  const router = createPrefillRoutes(controller);
  return { router };
}
