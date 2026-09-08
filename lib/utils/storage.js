// NOTE: declared with `var` (not `const`) so this file can be safely
// re-injected into an already-loaded tab by the popup's on-demand injection
// without throwing "Identifier has already been declared".
var Storage = {
    // Default Preferences — single source of truth used by getPreferences() and resetToDefaults()
    DEFAULT_PREFS: {
        autoSyncOnAcceptance: true,
        updateMasterReadme: true,
        syncNotifications: true,
        includeProblemDescription: true,
        themeMode: "dark",
        dailyGoal: 3,
        commitTemplate: "Add {difficulty} {language} Solution for {title} from {platform}"
    },

    // Repository defaults shared by getCredentials() and resetToDefaults()
    DEFAULT_REPO: {
        name: "CodePush-Solutions",
        branch: "main"
    },

    // Get all credentials and repo details
    getCredentials() {
        return new Promise((resolve) => {
            chrome.storage.local.get([
                "githubToken",
                "repoOwner",
                "repoName",
                "repoBranch",
                "lcUsername",
                "gfgUsername"
            ], (result) => {
                resolve({
                    token: result.githubToken || "",
                    owner: result.repoOwner || "",
                    repo: result.repoName || Storage.DEFAULT_REPO.name,
                    branch: result.repoBranch || Storage.DEFAULT_REPO.branch,
                    lcUsername: result.lcUsername || "",
                    gfgUsername: result.gfgUsername || ""
                });
            });
        });
    },

    // Save credentials (the token is only overwritten when provided)
    saveCredentials(data) {
        return new Promise((resolve) => {
            const toSave = {
                repoOwner: data.owner,
                repoName: data.repo,
                repoBranch: data.branch,
                lcUsername: data.lcUsername,
                gfgUsername: data.gfgUsername
            };
            if (data.token) {
                toSave.githubToken = data.token;
            }
            chrome.storage.local.set(toSave, resolve);
        });
    },

    // Get Preferences (missing keys fall back to DEFAULT_PREFS)
    getPreferences() {
        return new Promise((resolve) => {
            chrome.storage.local.get(Object.keys(Storage.DEFAULT_PREFS), (result) => {
                resolve({
                    // Booleans default to true, so only an explicitly stored false turns them off
                    autoSyncOnAcceptance: result.autoSyncOnAcceptance !== false,
                    updateMasterReadme: result.updateMasterReadme !== false,
                    syncNotifications: result.syncNotifications !== false,
                    includeProblemDescription: result.includeProblemDescription !== false,
                    themeMode: result.themeMode || Storage.DEFAULT_PREFS.themeMode,
                    dailyGoal: typeof result.dailyGoal === "number" ? result.dailyGoal : Storage.DEFAULT_PREFS.dailyGoal,
                    commitTemplate: result.commitTemplate || Storage.DEFAULT_PREFS.commitTemplate
                });
            });
        });
    },

    // Save Preferences
    savePreferences(prefs) {
        return new Promise((resolve) => {
            chrome.storage.local.set(prefs, resolve);
        });
    },

    // Get Stats
    getStats() {
        return new Promise((resolve) => {
            chrome.storage.local.get([
                "syncCount",
                "currentStreak",
                "maxStreak",
                "lastActiveDate",
                "recentSyncs",
                "leetcodeStats",
                "gfgStats"
            ], (result) => {
                resolve({
                    syncCount: result.syncCount || 0,
                    currentStreak: result.currentStreak || 0,
                    maxStreak: result.maxStreak || 0,
                    lastActiveDate: result.lastActiveDate || null,
                    recentSyncs: result.recentSyncs || [],
                    leetcode: result.leetcodeStats || { easy: 0, med: 0, hard: 0 },
                    gfg: result.gfgStats || { basic: 0, easy: 0, med: 0, hard: 0 }
                });
            });
        });
    },

    // Save Stats (storage keys are flattened: leetcode -> leetcodeStats, gfg -> gfgStats)
    saveStats(stats) {
        return new Promise((resolve) => {
            chrome.storage.local.set({
                syncCount: stats.syncCount,
                currentStreak: stats.currentStreak,
                maxStreak: stats.maxStreak,
                lastActiveDate: stats.lastActiveDate,
                recentSyncs: stats.recentSyncs,
                leetcodeStats: stats.leetcode,
                gfgStats: stats.gfg
            }, resolve);
        });
    },

    // Reset settings & preferences to defaults (also clears the stored GitHub token)
    resetToDefaults() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(() => {
                chrome.storage.local.set({
                    repoName: Storage.DEFAULT_REPO.name,
                    repoBranch: Storage.DEFAULT_REPO.branch,
                    ...Storage.DEFAULT_PREFS,
                    syncCount: 0,
                    currentStreak: 0,
                    maxStreak: 0,
                    lastActiveDate: null,
                    recentSyncs: [],
                    leetcodeStats: { easy: 0, med: 0, hard: 0 },
                    gfgStats: { basic: 0, easy: 0, med: 0, hard: 0 }
                }, resolve);
            });
        });
    },

    // Check and expire the streak dynamically on load.
    // lastActiveDate is stored as a "YYYY-MM-DD" string (en-CA locale, written by
    // incrementStats in background.js). Both dates parse to UTC midnight, so the
    // day difference stays exact regardless of the local timezone.
    async checkStreakExpiry() {
        const stats = await this.getStats();
        if (!stats.lastActiveDate) return stats;

        const todayStr = new Date().toLocaleDateString('en-CA');
        const diffDays = Math.round((new Date(todayStr) - new Date(stats.lastActiveDate)) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            stats.currentStreak = 0;
            await new Promise((resolve) => {
                chrome.storage.local.set({ currentStreak: 0 }, resolve);
            });
        }
        return stats;
    }
};

// Global export for content scripts and background context
if (typeof window !== 'undefined') {
    window.Storage = Storage;
}
