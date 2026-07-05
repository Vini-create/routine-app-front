export const firstAccessTourVersion = 2;
export const firstAccessTourStartEvent = "winperium:first-access-tour:start";

const offerKey = `winperium:first-access-tour:v${firstAccessTourVersion}:offer`;
const progressKey = `winperium:first-access-tour:v${firstAccessTourVersion}:progress`;

function completionKey(userId: string) {
  return `winperium:first-access-tour:v${firstAccessTourVersion}:completed:${userId}`;
}

function storage() {
  return window.sessionStorage;
}

export function markFirstAccessTourOfferPending() {
  try {
    storage().setItem(offerKey, "true");
  } catch {
    // The invitation can still be opened manually when storage is unavailable.
  }
}

export function hasPendingFirstAccessTourOffer() {
  try {
    return storage().getItem(offerKey) === "true";
  } catch {
    return false;
  }
}

export function clearFirstAccessTourOffer() {
  try {
    storage().removeItem(offerKey);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}

export function readFirstAccessTourProgress(totalSteps: number) {
  try {
    const storedValue = storage().getItem(progressKey);
    if (storedValue === null) return null;
    const value = Number(storedValue);
    return Number.isInteger(value) && value >= 0 && value < totalSteps ? value : null;
  } catch {
    return null;
  }
}

export function saveFirstAccessTourProgress(step: number) {
  try {
    storage().setItem(progressKey, String(step));
  } catch {
    // The in-memory tour state remains available.
  }
}

export function clearFirstAccessTourProgress() {
  try {
    storage().removeItem(progressKey);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}

export function hasCompletedFirstAccessTour(userId: string) {
  try {
    return window.localStorage.getItem(completionKey(userId)) === "true";
  } catch {
    return false;
  }
}

export function completeFirstAccessTour(userId: string) {
  try {
    window.localStorage.setItem(completionKey(userId), "true");
  } catch {
    // Completion remains best-effort when persistent storage is unavailable.
  }
  clearFirstAccessTourOffer();
  clearFirstAccessTourProgress();
}

export function resetFirstAccessTour(userId: string) {
  try {
    window.localStorage.removeItem(completionKey(userId));
  } catch {
    // The replay still starts in memory when persistent storage is unavailable.
  }
}

export function requestFirstAccessTour(userId: string) {
  resetFirstAccessTour(userId);
  clearFirstAccessTourOffer();
  saveFirstAccessTourProgress(0);
  window.dispatchEvent(new Event(firstAccessTourStartEvent));
}

export function clearFirstAccessTourSession() {
  clearFirstAccessTourOffer();
  clearFirstAccessTourProgress();
}
