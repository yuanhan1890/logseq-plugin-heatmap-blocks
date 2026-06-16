import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

import React from "react";
import { createRoot } from "react-dom/client";
import { Calendar } from "./Calendar";
import { provideStyle } from "./provideStyle";

function main() {
  const pluginId = logseq.baseInfo.id;
  console.info(`#${pluginId}: MAIN`);

  function parseCodeBlock(content: string): string {
    const trimmed = content.trim();
    if (!trimmed.startsWith("```")) return "";

    const lines = trimmed.split("\n");
    if (lines.length <= 2) return "";

    return lines.slice(1, -1).join("\n").trim();
  }

  function formatJournalDay(dayNum: number | string): string {
    if (!dayNum) return "";
    const s = String(dayNum);
    if (s.length !== 8) return s;
    return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
  }

  provideStyle();

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const uuid = payload.uuid;
    const [type] = payload.arguments;
    if (!type) return;

    const heatmapId = `heatmap_${uuid}_${slot}`;
    if (type !== ":heatmap" && type !== "heatmap") return;

    const blk = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    });
    if (!blk || !blk.children || blk.children.length === 0) return;

    const firstChild = blk.children[0] as BlockEntity;
    if (!firstChild) return;

    const rawContent = firstChild.content || "";
    const queryString = parseCodeBlock(rawContent);

    if (!queryString) {
      logseq.provideUI({
        key: `${heatmapId}`,
        slot,
        reset: true,
        template: `<div style="color: var(--ls-error-text-color);">[Heatmap Failed]: First Child Note Should Contain Datascript Query</div>`,
      });
      return;
    }

    try {
      const queryResult: any[] = await logseq.DB.datascriptQuery(queryString);

      const formattedData = queryResult.map((item: any) => {
        const page = item[0];
        const count = item[1];
        return {
          date: formatJournalDay(page["journal-day"]),
          count,
        };
      });

      const secondChild = blk.children[1] as BlockEntity;
      let attributes = {};
      if (secondChild) {
        const attributesData = parseCodeBlock(secondChild.content || "");
        try {
          attributes = JSON.parse(attributesData);
        } catch {
          // ignore
        }
      }

      const containerId = `heatmap-root-${slot}`;

      logseq.provideUI({
        key: `${heatmapId}`,
        slot,
        reset: true,
        template: `<div id="${containerId}" data-on-macro-staged="true"></div>`,
      });

      setTimeout(() => {
        const mountNode = parent.document.getElementById(containerId);
        if (!mountNode) return;

        const root = createRoot(mountNode);

        root.render(<Calendar formattedData={formattedData} {...attributes} />);
      }, 50);
    } catch (error: any) {
      console.error("[Heatmap Query Error]:", error);
      logseq.provideUI({
        key: `${heatmapId}`,
        slot,
        reset: true,
        template: `<div style="color: var(--ls-error-text-color);">[Heatmap Query Failed]: ${error.message}</div>`,
      });
    }
  });
}

logseq.ready(main).catch(console.error);
