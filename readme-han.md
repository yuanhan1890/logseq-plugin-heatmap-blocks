# Logseq Heatmap Block Plugin

本插件根据提供dataquery来渲染热力图，并提供一点点样式配置，你可以用于跟踪习惯。

## 如何使用

输入`/Heatmap`，自动生成一个查询某block reference在每篇日志中的内容的data query，以及一个json代码，你可以将图表参数写在json中

对查询结果，尝试解析是否带有数字，解析失败会算作`1`，然后汇总当日的总和。

| 参数 | 类型 | 说明 |
| -------- | -------- | -------- |
| formattedData   | Array<{ date: string, count: number }>  | 由dataquery查询得到，日期格式为"YYYY-MM-DD"  |
| startDate   | string?  | 展示的起始日期，格式YYYY-MM-DD  |
| endDate   | string?  | 展示的终止日期，格式YYYY-MM-DD  |
| title   | string?  | 图表标题  |
| titleAlign   | "left" | "right" | "center"  | 图表标题对齐方式  |
| unit   | string? | 活动次数单位  |
| unitPural   | string? | 活动次数单位，复数  |
| colorPalette   | string[]? | 自定义颜色，默认有0-4阶，自定义颜色只支持6位hex code  |
| defaultFill   | string? | 默认元素背景色  |
| showTotalTimes   | boolean? | 展示总次数  |
| showActiveDays   | boolean? | 展示总天数  |
| showPeakDays   | boolean? | 展示单天最大次数 |
| showLongestStreak   | boolean? | 展示最长连续活跃天数 |
| enableTooltip   | boolean? | 是否启用热力图单元格 tooltip，默认为 `true` |
| tooltipContentTemplate   | string? | 有记录日期的 tooltip 内容模版，支持 `{date}` 和 `{count}`，默认为 `"{date}: {count} times"` |
| tooltipFallback   | string? | 无记录日期的 tooltip 内容，默认为 `"无记录"` |


## Demo

![](./demo.png)
![](./demo1.png)

### 浏览每天日志的block数量

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
  "endDate": "2026-12-31",
  "enableTooltip": true,
  "tooltipContentTemplate": "{date}: {count} times",
  "tooltipFallback": "无记录"
}
```
