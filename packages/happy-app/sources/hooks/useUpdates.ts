// Updates disabled for self-managed builds
export function useUpdates() {
    return {
        updateAvailable: false,
        isChecking: false,
        checkForUpdates: async () => {},
        reloadApp: async () => {},
    };
}
