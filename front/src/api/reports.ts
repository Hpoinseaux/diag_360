import { apiFetch } from "./client";
import { FlashReportRequest, FlashReportResponse } from "./types";

export async function createFlashReport(payload: FlashReportRequest): Promise<FlashReportResponse> {
  return apiFetch<FlashReportResponse>("/reports/flash", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
