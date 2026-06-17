# Logseq Heatmap Block Plugin

[漢语文档](./readme-han.md)

This plugin renders a heatmap based on a provided data query and offers minor styling configurations. You can use it to track habits.

## How to Use

Type `/Heatmap` to automatically generate a data query that tracks the content of a specific block reference across each daily log, along with a JSON code block where you can write your chart parameters.

### React tooltip button example

Type `/Tooltip Button` to insert a renderer macro that mounts a React button through `logseq.App.onMacroRendererSlotted`.

```text
{{renderer :tooltip-button, Hover me, Tooltip rendered by react-tooltip}}
```

The example uses the open-source [`react-tooltip`](https://github.com/ReactTooltip/react-tooltip) package. The button passes tooltip metadata with `data-tooltip-id` and `data-tooltip-content`, then renders `<Tooltip />` from React so the tooltip appears when the user hovers or focuses the button.

For the query results, the plugin will attempt to parse whether they contain numbers. If parsing fails, it will default to a count of `1`, and then aggregate the total for that day.

| Parameter | Type | Description |
| -------- | -------- | -------- |
| formattedData | Array<{ date: string, count: number }> | Retrieved via the data query; date format is "YYYY-MM-DD" |
| startDate | string? | start date of tracking, format: "YYYY-MM-DD" |
| endDate | string? | end date of tracking, format: "YYYY-MM-DD" |
| title | string? | Chart title |
| titleAlign | "left" \| "right" \| "center" | Chart title alignment |
| unit | string? | Unit for the number of activities |
| unitPural | string? | Plural unit for the number of activities |
| colorPalette | string[]? | Custom colors; features levels 0–4 by default. Custom colors only support 6-digit hex codes |
| defaultFill | string? | Default background color for elements |
| showTotalTimes | boolean? | Display total number of times |
| showActiveDays | boolean? | Display total number of active days |
| showPeakDays | boolean? | Display maximum count in a single day |
| showLongestStreak | boolean? | Display the longest continuous active streak |


## Demo

![](./demo.png)
![](./demo1.png)

### View blocks count per journal note

```clojure
[:find ?d (count ?b)
    :where
    [?b :block/page ?p]
    [?p :block/journal? true]
    [?p :block/journal-day ?d]
    [?b :block/content ?c]
    [(clojure.string/blank? ?c) ?empty]
    [(not ?empty)]
    [(>= ?d 20260101)]
    [(<= ?d 20261231)]
]
```

```json
{
  "title": "📓✨✍️",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```
