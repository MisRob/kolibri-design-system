<!-- Temporary file -->

# MisRob's dev journal for KCardGrid

## References

- https://www.figma.com/design/lbzqOURWzAM5s21Jm3hEmi/Kolibri-Card-Breakpoints-%2F-Grids?node-id=1-506&t=ou4npqlXsNRyApxd-0
- https://www.figma.com/file/9MpVLwkHGrLx99kEPhY33O/principle-skeleton-loader?type=design&node-id=0%3A1&mode=design&t=f3FmnTo2MK2UH5gl-1

- https://www.notion.so/learningequality/Create-technical-specification-for-KDS-card-grid-component-s-fc65d0fab08e4aef895b870dbd1bd82b


- https://github.com/learningequality/kolibri-design-system/issues/697
- https://github.com/learningequality/kolibri-design-system/issues/703


- https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- https://web.dev/articles/animations-guide
- https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance

## PoC

- [x] Add `rowHeight` to `KCardGrid` prop and relatedly address https://github.com/learningequality/kolibri-design-system/issues/703
- [x]] Make grid configurable for each breakpoint
  - But provide shortcut props that take effect in each breakpoint. For example, in addition to `rowHeight` in the breakpoings `config`, we can still have `rowHeigh` prop that overrides it. 
- [x] During ^, observe what are the most common grid configurations and assess whether adding an API shortcut to support the most common modes would make sense or no.
- [x] Skeleton loaders (https://learningequality.slack.com/archives/C0LKG14NL/p1712759781276269).

## TODOs

- Animation
  - https://learningequality.slack.com/archives/C0LKG14NL/p1712772705579659?thread_ts=1712759781.276269&cid=C0LKG14NL
- Tune when/how/for how long skeletons should display
  - https://learnvue.co/articles/vue-skeleton-loading
- a11y of the loading state when skeletons are displayed
  - https://vuetifyjs.com/en/components/skeleton-loaders/#configuring-the-aria-label
- This will be solved by isSkeleton mode of KCard, however, investigate why '"[vue-router] Route with name '/' does not exist" is being triggered hundreds of times per one KEYTAB press - could point to a problem with implementation
- Relatedly, test for performance of larger grids
- "Injection "cardGridStyle" not found." happens when KCard used outside of KCardGrid. Provide more informative error.
- Investigate why for 'auto' default height some sections can overflow
- Broken thumbnail height on horizontal layouts when small image (hummingbird small) - seems to have something with min-content/auto/100% settings on the default height


## Documentation

- Card always needs to be used within grid, and needs to be direct children
- Width/height of card are configured via grid
- If grids 'rowHeight' default (that is min-content), skeleton cards cannot estimate what height it should take because it has no content. In that case, use shortcut props or config and set 'loadingCardHeight' to a value that loaded cards with content take. 
- Technique with fixed heights and 'preserve..' prop for making cards sections placed on the same horizontal line in a grid
  ```
  <template #belowTitle>
      <div :style="{ height: '24px', overflow: 'hidden' }">
        Below title below title below title below
      </div>
    </template>
    ``` 
- loading - min height on the grid container helpful if another section below the grid

## Ideas

### Grid kinds

Currently '1-2' and '1-2-3'. But it may work better to define on which breakpoint we should add a column since that doesn't really tie KDS to certain layouts that much! Something like a prop `addColumnOnBreakpoints`: [ 1, 4, 5]? Cons is readability. And also, we can still override config so perhaps that's better.
