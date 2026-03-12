---
description: Create a feature spec file from a short idea
argument-hint: Short feature description
allowed-tools: Read, Write, Glob
---

You are helping to spin up a new feature spec for this application from a short idea provided in the user input below. Always adhere to any rules or requirements set out in any CLAUDE.md files when responding.

User input: $ARGUMENTS

## High level behavior

Your job will be to turn the user input above into:

- A human friendly feature title in Title Case
- A feature slug in kebab-case (e.g. `push-notifications`)
- A detailed markdown spec file under the `_specs/` directory

Then save the spec file to disk and print a short summary of what you did.

## Step 1. Parse the arguments

From `$ARGUMENTS`, extract:

1. `feature_title`
   - A short, human readable title in Title Case.
   - Example: "Push Notifications for New Movies".

2. `feature_slug`
   - A safe slug for the filename.
   - Rules:
     - Lowercase
     - Kebab-case
     - Only `a-z`, `0-9` and `-`
     - Replace spaces and punctuation with `-`
     - Collapse multiple `-` into one
     - Trim `-` from start and end
     - Maximum length 40 characters
   - Example: `push-notifications` or `push-notifications-new-movies`.

If you cannot infer a sensible `feature_title` and `feature_slug`, ask the user to clarify instead of guessing.

## Step 2. Draft the spec content

Create a markdown spec document that Plan mode can use directly and save it in the `_specs/` folder using the `feature_slug` as the filename. Use the exact structure defined in `_specs/template.md`. Do not add technical implementation details such as code examples.

## Step 3. Final output to the user

After the file is saved, respond with a short summary in this exact format:

Spec file: _specs/<feature_slug>.md
Title: <feature_title>

Do not repeat the full spec in the chat output unless the user explicitly asks to see it.
