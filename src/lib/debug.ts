export function visualizationDebug(event: string, details: Record<string, unknown> = {}): void {
  if (process.env.NODE_ENV !== "production" || process.env.VISUALIZATION_DEBUG_LOGS === "true") {
    console.info(`[weight-visualizer] ${JSON.stringify({ event, ...details })}`);
  }
}
