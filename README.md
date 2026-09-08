## CodePush

A lightweight extension that automatically syncs your accepted
**LeetCode** and **GeeksforGeeks** solutions to a **GitHub** repository. code file +
README per problem, with progress tracking, streaks, and roadmap sheets (Grind 75/100,
NeetCode 150, Striver SDE) built into the popup.

## Features

- 🔄 **Auto-sync** - an accepted submission is pushed to GitHub automatically.
- 🖱️ **Manual sync** - one click from the popup for the currently open problem.
- 📊 **Progress dashboard** - solved counts, difficulty breakdown, and roadmap checklists.
- 🎉 **Celebration banner** - the popup congratulates you right after a successful push.
- 🔐 **Private by default** - your PAT and repo settings stay in local browser storage.

## Installation (Developer Mode)

1. Download/clone this folder.
2. Open `chrome://extensions` and enable **Developer mode** (top right).
3. Click **Load unpacked** and select the extension folder.

## Usage

1. Click the extension icon → **Settings** (gear icon).
2. Paste a GitHub [Personal Access Token](https://github.com/settings/tokens)
   (repo scope) → **Fetch user** → confirm owner/repo → **Save Changes**
   (the repo is created automatically as private if it doesn't exist).
3. Open any LeetCode or GeeksforGeeks problem and get it **Accepted** -
   the solution is pushed automatically and the popup shows a congratulations banner.
4. Use the **Progress / Sheets** tabs to track solved counts and roadmap checklists.

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`.
2. No build step - plain HTML/CSS/JS. Just edit and reload the extension in
   `chrome://extensions` (↻ button).
3. Keep changes minimal and test on both LeetCode and GFG.
4. Open a Pull Request with a short description of what/why.

Project layout: `content/` (content scripts + page-context injector),
`lib/` (platform scrapers & observers, GitHub API + README generator, shared
utils), `background/` (service worker), `popup/` (dashboard UI), `icons/`,
`docs/` (agent handoff notes).

## License

MIT
