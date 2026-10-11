"use strict";
let creatingOffscreen = null;
const OFFSCREEN_PAGE = "offscreen.html";

async function offscreenReady() {
  const url = chrome.runtime.getURL(OFFSCREEN_PAGE);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"], documentUrls: [url]
  });
  if (contexts.length) return;
  if (!creatingOffscreen) {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: OFFSCREEN_PAGE, reasons: ["WORKERS", "BLOBS", "CLIPBOARD"],
      justification: "Kullanıcının seçtiği Chrome sekme görüntüsünü yerel Türkçe OCR ile tanıyıp panoya kopyalamak."
    }).finally(() => { creatingOffscreen = null; });
  }
  await creatingOffscreen;
}

async function tellTab(tabId, message) {
  try { await chrome.tabs.sendMessage(tabId, message); }
  catch (error) { console.warn("OCR: tab unavailable", String(error)); }
}

async function start(tab) {
  if (!tab || !Number.isInteger(tab.id)) return;
  try {
    await chrome.scripting.executeScript({
      target: {tabId: tab.id}, files: ["content.js"]
    });
  } catch (error) {
    console.warn("OCR cannot start on this page:", String(error));
  }
}

chrome.action.onClicked.addListener(tab => { void start(tab); });
chrome.commands.onCommand.addListener(async name => {
  if (name !== "start-ocr") return;
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  await start(tab);
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || typeof message.type !== "string") return;
  if (message.type === "OPEN_SHORTCUT_SETTINGS") {
    const shortcutPage = navigator.userAgent.includes("Edg/") ? "edge://extensions/shortcuts" : "chrome://extensions/shortcuts";
    void chrome.tabs.create({url: shortcutPage});
    return;
  }
  if (message.type === "OCR_CAPTURE" && sender.tab?.id != null) {
    const tabId = sender.tab.id;
    const tabWindowId = sender.tab.windowId;
    void (async () => {
      try {
        const {rect, viewport} = message;
        if (!rect || !viewport || rect.width < 8 || rect.height < 8 ||
            viewport.width < 1 || viewport.height < 1) {
          throw new Error("Seçili alan geçersiz.");
        }
        // The selection overlay has been hidden before this screenshot.
        const screenshot = await chrome.tabs.captureVisibleTab(tabWindowId, {format: "png"});
        await offscreenReady();
        await chrome.runtime.sendMessage({
          target: "offscreen", type: "OCR_PROCESS", screenshot, rect, viewport, tabId
        });
      } catch (error) {
        await tellTab(tabId, {type:"OCR_FAILED", error:String(error?.message || error)});
      }
    })();
  } else if ((message.type === "OCR_FINISHED" || message.type === "OCR_FAILED" ||
              message.type === "OCR_PROGRESS") && sender.url?.endsWith("/offscreen.html")) {
    void tellTab(message.tabId, message);
  }
});
