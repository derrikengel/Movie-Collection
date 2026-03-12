# Claude Code Setup Guide

How to get the most out of Claude Code for this project.

---

## 1. Place These Files in Your Repo Root

Copy these three files into the root of your project repo (alongside `package.json`):

```
CLAUDE.md           ← Main project context (Claude reads this automatically)
REMAINING_WORK.md   ← Tracks what's left to build
PATTERNS.md         ← Code conventions reference
```

Claude Code automatically reads `CLAUDE.md` at the start of every session. The other files are referenced on demand — you can tell Claude to read them or it will find them when relevant.

---

## 2. How Claude Code Works Differently from Claude.ai

Claude Code runs in your terminal inside your actual project directory. Key differences:

- **It can read, write, and edit your actual files directly** — no copy/pasting
- **It runs terminal commands** — `npm install`, `git commit`, etc.
- **It sees your full codebase** — you can ask "find all places we use backdrop-filter" and it'll search
- **Sessions don't have persistent memory** — `CLAUDE.md` is how context carries over between sessions
- **It's agentic** — it can chain multiple steps (read file → edit file → run build → check errors) without you directing each step

---

## 3. Starting a Session

Always start a new Claude Code session with:

```
Read CLAUDE.md, REMAINING_WORK.md, and PATTERNS.md to get up to speed on this project.
```

Then tell it what you want to work on:

```
Let's build the individual list views (WatchlistView, WatchedView, FavoritesView, IgnoredView).
See REMAINING_WORK.md for the spec.
```

---

## 4. Recommended Custom Commands

Create a `.claude/commands/` directory in your project root. Each `.md` file becomes a slash command you can trigger with `/command-name`.

### `.claude/commands/context.md`
```markdown
Read CLAUDE.md, REMAINING_WORK.md, and PATTERNS.md. Summarize what the project is, what's built, and what's next.
```

### `.claude/commands/new-component.md`
```markdown
Create a new Vue component. Use CSS Modules with `module="s"`, camelCase class names, and Composition API with `<script setup>`. Follow the structure in PATTERNS.md. Ask me for the component name and purpose before starting.
```

### `.claude/commands/new-view.md`
```markdown
Create a new view component. Add `container-type: inline-size` to the root element. Follow all patterns in PATTERNS.md. Check CLAUDE.md for the route this view will live at. Ask me for the view name and purpose before starting.
```

### `.claude/commands/review.md`
```markdown
Review the file I specify for: consistency with PATTERNS.md conventions, any missing accessibility attributes, correct CSS Modules usage, and any obvious bugs. Don't rewrite it — just give me a list of issues.
```

### `.claude/commands/fix-overlay.md`
```markdown
This component has a bottom sheet or modal that isn't positioning correctly. The likely cause is backdrop-filter on an ancestor creating a containing block for position:fixed children. Apply the Teleport fix described in PATTERNS.md.
```

---

## 5. Tips for Working with Claude Code

### Be specific about file scope
```
# Too vague
"Fix the filter sheet"

# Better  
"In src/components/FilterBar.vue, the mobile filter sheet isn't filling the screen correctly.
The .sheet element is rendering with almost no height. Apply the Teleport fix from PATTERNS.md."
```

### Reference the docs files
```
"Add a new list view following the spec in REMAINING_WORK.md"
"Make sure this component follows PATTERNS.md conventions"
```

### Ask it to check before it changes
```
"Before editing anything, read the current file and tell me what you plan to change."
```

### Use it for multi-step tasks
```
"Create the WatchlistView component, add it to the router, and update the ProfileView 
list card link to point to it. Check that the route requires auth."
```

### Commit checkpoints
Ask Claude Code to commit after completing discrete pieces of work:
```
"After you finish the component, commit it with a descriptive message."
```

---

## 6. What Claude Code is Great For on This Project

- **Building out the remaining list views** — clear spec in REMAINING_WORK.md
- **Finding and fixing inconsistencies** — "check all views for components not using CSS Modules"
- **Refactoring** — "extract the service formatting logic into a composable"
- **PWA setup** — vite-plugin-pwa configuration is fiddly; Claude Code can handle the config
- **Migration script** — writing and iterating on the Firebase → Supabase migration script
- **Accessibility pass** — "audit all icon-only buttons for missing aria-labels"
- **Debugging** — paste an error, it reads the relevant files and fixes it

---

## 7. What to Keep in Mind

- **Always review changes before committing** — Claude Code is fast but not infallible
- **It doesn't know what's visually broken** — you still need to eyeball the result in the browser
- **Keep CLAUDE.md updated** — when you make significant architectural decisions, add them
- **Update REMAINING_WORK.md as you complete things** — mark items done so Claude knows what's built
