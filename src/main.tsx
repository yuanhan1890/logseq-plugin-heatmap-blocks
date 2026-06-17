import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { Calendar } from "./Calendar";
import { provideStyle } from "./provideStyle";
import { provideTooltipStyle } from "./provideTooltipStyle";
import { groupBy, map, mapValues, sumBy } from "lodash-es";

const mountedRoots = new Map<string, Root>();
const pendingMountTimers = new Map<string, number>();

function main() {
  const pluginId = logseq.baseInfo.id;
  console.info(`#${pluginId}: MAIN`);

  function disposeRenderer(key: string) {
    const timer = pendingMountTimers.get(key);
    if (timer) {
      window.clearTimeout(timer);
      pendingMountTimers.delete(key);
    }

    const root = mountedRoots.get(key);
    if (root) {
      root.unmount();
      mountedRoots.delete(key);
    }
  }

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

  logseq.Editor.registerSlashCommand("Heatmap", async (e) => {
    const currentBlockUuid = e.uuid;

    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :heatmap_${currentBlockUuid}}}`,
    );

    const clojureContent = `\`\`\`clojure
[:find ?page-day ?block-content
 :where
   [?b :block/page ?p]
   [?p :block/journal? true]
   [?p :block/journal-day ?page-day]
   [?b :block/refs ?ref]
   [?ref :block/uuid #uuid "6a314c09-158e-4cfd-b8c8-a1257ade3008"]
   [?b :block/content ?block-content]
]
\`\`\``;
    const firstChild = await logseq.Editor.insertBlock(
      currentBlockUuid,
      clojureContent,
      {
        sibling: false, // false 表示作为子 block 插入
        before: false, // 插入在父 block 的最底下
      },
    );

    if (firstChild) {
      const jsonContent = `\`\`\`json\n{}\n\`\`\``;
      await logseq.Editor.insertBlock(firstChild.uuid, jsonContent, {
        sibling: true, // true 表示和 firstChild 属于同级（兄弟关系）
        before: false, // 放在 firstChild 的后面
      });
    }
  });

  provideStyle();
  provideTooltipStyle();

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const uuid = payload.uuid;
    const [type] = payload.arguments;
    if (!type) return;

    const macroType = type.replace(/^:/, "");
    const heatmapId = `heatmap_${uuid}_${slot}`;
    if (!macroType.startsWith("heatmap")) return;

    const blk = await logseq.Editor.getBlock(uuid, {
      includeChildren: true,
    });
    if (!blk || !blk.children || blk.children.length === 0) return;

    const firstChild = blk.children[0] as BlockEntity;
    if (!firstChild) return;

    const rawContent = firstChild.content || "";
    const queryString = parseCodeBlock(rawContent);

    if (!queryString) {
      disposeRenderer(heatmapId);
      logseq.provideUI({
        key: `${heatmapId}`,
        slot,
        reset: true,
        template: `<div style="color: var(--ls-error-text-color);">[Heatmap Failed]: First Child Note Should Contain Datascript Query</div>`,
      });
      return;
    }

    const secondChild = blk.children[1] as BlockEntity;
    let attributes: any = {};
    if (secondChild) {
      const attributesData = parseCodeBlock(secondChild.content || "");
      try {
        attributes = JSON.parse(attributesData);
      } catch {
        // ignore
      }
    }

    try {
      const queryResult: any[] = await logseq.DB.datascriptQuery(queryString);

      if (attributes.debug) {
        console.log("QUERY_RESULT", queryResult);
      }

      const formattedData = map(
        mapValues(
          groupBy(
            queryResult.map((item: any) => {
              const journalDay = item[0];
              const content = item[1];
              let count = content;
              if (typeof content === "string") {
                const cleanedContent = content.replace(
                  /\(\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\)\)/gi,
                  "",
                );
                count = cleanedContent.match(/\d+/);
                count = count != null ? Number(count[0]) : 1;
              }
              return {
                date: formatJournalDay(journalDay),
                count,
              };
            }),
            "date",
          ),
          (record) => sumBy(record, "count"),
        ),
        (value, key) => ({ date: key, count: value }),
      );

      if (attributes.debug) {
        console.log("FORMATTED_DATA", formattedData);
      }

      const containerId = `heatmap-root-${slot}`;

      disposeRenderer(heatmapId);
      logseq.provideUI({
        key: `${heatmapId}`,
        slot,
        reset: true,
        template: `<div id="${containerId}" data-on-macro-staged="true"></div>`,
      });

      const mountTimer = window.setTimeout(() => {
        pendingMountTimers.delete(heatmapId);

        const mountNode = parent.document.getElementById(containerId);
        if (!mountNode) return;

        const root = createRoot(mountNode);
        mountedRoots.set(heatmapId, root);

        root.render(<Calendar formattedData={formattedData} {...attributes} />);
      }, 50);
      pendingMountTimers.set(heatmapId, mountTimer);
    } catch (error: any) {
      console.error("[Heatmap Query Error]:", error);
      disposeRenderer(heatmapId);
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
