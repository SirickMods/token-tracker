# token-tracker

A Claude Code mod that shows how many tokens the current chat is using in a bar above the chat input, and pops up an alert (dialog, toast and notification) when the chat reaches 250,000 tokens. The count is the chat's current context size, updated after each reply. The alert re-arms if usage drops back under the limit (after /compact or /clear). Change `LIMIT` in `hooks/register.tsx` to use a different threshold.

## Install

At the prompt of a terminal session:

```
/plugin install token-tracker --marketplace SirickMods/token-tracker
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install token-tracker --marketplace SirickMods/token-tracker
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `SirickMods/token-tracker`, then Add plugin.

This repository is private: installing needs read access to it and a git credential for github.com on your machine (an SSH key, or `gh auth login` then `gh auth setup-git`).

Turn it on or off any time from the `/plugin` menu.
