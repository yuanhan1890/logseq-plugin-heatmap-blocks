export const provideStyle = () => {
  logseq.provideStyle(`
*,:before,:after {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: #e5e7eb
}

* {
    --tw-ring-inset: var(--tw-empty, );
    --tw-ring-offset-width: 0px;
    --tw-ring-offset-color: #fff;
    --tw-ring-color: rgba(59, 130, 246, .5);
    --tw-ring-offset-shadow: 0 0 #0000;
    --tw-ring-shadow: 0 0 #0000;
    --tw-shadow: 0 0 #0000
}

:root {
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4
}

:-moz-focusring {
    outline: 1px dotted ButtonText
}

:-moz-ui-invalid {
    box-shadow: none
}

::moz-focus-inner {
    border-style: none;
    padding: 0
}

::-webkit-inner-spin-button,::-webkit-outer-spin-button {
    height: auto
}

::-webkit-search-decoration {
    -webkit-appearance: none
}

::-webkit-file-upload-button {
    -webkit-appearance: button;
    font: inherit
}

[type=search] {
    -webkit-appearance: textfield;
    outline-offset: -2px
}

abbr[title] {
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted
}

a {
    color: inherit;
    text-decoration: inherit
}

body {
    margin: 0;
    font-family: inherit;
    line-height: inherit
}

html {
    -webkit-text-size-adjust: 100%;
    font-family: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";
    line-height: 1.5
}

p {
    margin: 0
}

strong {
    font-weight: bolder
}

.block {
    display: block
}

.font-semibold {
    font-weight: 600
}

.font-medium {
    font-weight: 500
}

.text-xs {
    font-size: .75rem;
    line-height: 1rem
}

.mt-1 {
    margin-top: .25rem
}

.mb-2 {
    margin-bottom: .5rem
}

.opacity-70 {
    opacity: .7
}

.p-4 {
    padding: 1rem
}

.inset-0 {
    inset: 0
}

.text-right {
    text-align: right
}

.text-red-500 {
    --tw-text-opacity: 1;
    color: rgba(239,68,68,var(--tw-text-opacity))
}

.visible {
    visibility: visible
}

.light .heatmap-root {
    --tw-bg-opacity: 1;
    background-color: rgba(255,255,255,var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgba(107,114,128,var(--tw-text-opacity))
}

.dark .heatmap-root {
    --tw-bg-opacity: 1;
    background-color: rgba(0,0,0,var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgba(209,213,219,var(--tw-text-opacity))
}

.heatmap-root {
    border-radius: .25rem;
    font-family: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";
    padding: .5rem 1rem;
    --tw-shadow: 0 4px 6px -1px rgb(0 0 0/.1),0 2px 4px -2px rgb(0 0 0/.1);
    --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color),0 2px 4px -2px var(--tw-shadow-color);
    -webkit-box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
    box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
    user-select: none
}

svg.react-calendar-heatmap {
    overflow: visible
}

.react-calendar-heatmap text {
    fill: #555;
    font-size: 8px
}

.react-calendar-heatmap .react-calendar-heatmap-small-text {
    font-size: 5px
}

.react-calendar-heatmap rect {
    outline: 2px solid transparent;
    outline-offset: 2px
}

.react-calendar-heatmap rect:hover {
    stroke: #555!important;
    stroke-width: 1px
}

.react-calendar-heatmap rect.today {
    stroke: #dd7c09!important
}

.react-calendar-heatmap rect.active {
    stroke: #ff00c8!important
}

.dark .react-calendar-heatmap rect {
    stroke: #ffffff0d;
    stroke-width: 1px
}

.dark .react-calendar-heatmap .color-github-0 {
    fill: #161b22;
    stroke: transparent
}

.dark .react-calendar-heatmap .color-github-1 {
    fill: #0e4429
}

.dark .react-calendar-heatmap .color-github-2 {
    fill: #006d32
}

.dark .react-calendar-heatmap .color-github-3 {
    fill: #26a641
}

.dark .react-calendar-heatmap .color-github-4 {
    fill: #39d353
}

.light .react-calendar-heatmap rect {
    stroke: #1b1f230f;
    stroke-width: 1px
}

.light .react-calendar-heatmap .color-github-0 {
    fill: #eee;
    stroke: transparent
}

.light .react-calendar-heatmap .color-github-1 {
    fill: #9be9a8
}

.light .react-calendar-heatmap .color-github-2 {
    fill: #40c463
}

.light .react-calendar-heatmap .color-github-3 {
    fill: #30a14e
}

.light .react-calendar-heatmap .color-github-4 {
    fill: #216e39
}

.date-range-tag {
    --tw-bg-opacity: 1;
    background-color: rgba(209,213,219,var(--tw-bg-opacity));
    --tw-bg-opacity: .2;
    border-radius: .25rem;
    border-width: 1px;
    cursor: pointer;
    margin-left: .25rem;
    margin-right: .25rem;
    opacity: .6;
    padding-left: .5rem;
    padding-right: .5rem
}

.light .date-range-tag {
    --tw-border-opacity: 1;
    border-color: rgba(229,231,235,var(--tw-border-opacity))
}

.dark .date-range-tag {
    --tw-border-opacity: 1;
    border-color: rgba(55,65,81,var(--tw-border-opacity))
}

.date-range-tag:hover {
    opacity: 1
}
`);
};
