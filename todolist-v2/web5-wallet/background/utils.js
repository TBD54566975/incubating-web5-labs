import { v4 as uuidv4 } from "uuid";
import { storageWatcher } from "./lib/storage-watcher";

/**
 * 
 * @param {string} path - indicates what to render in the window. check ui/router/index.js for options
 * @returns {chrome.windows.Window} metadata about the created window
 */
export async function openUserConsentWindow(path, data) {
  const taskId = uuidv4();
  await chrome.storage.session.set({ [taskId]: data });


  const currentWindow = await chrome.windows.getLastFocused();
  await chrome.windows.create({
    width: 459,
    height: 692,
    top: 100,
    left: currentWindow.width - 500,
    type: 'popup',
    url: `/index.html#/${path}?task=${taskId}`
  });

  return new Promise((resolve, reject) => {
    storageWatcher.once('session', taskId, async (_, newValue) => {
      await chrome.storage.session.remove(taskId);
      resolve(newValue);
    });
  });
}