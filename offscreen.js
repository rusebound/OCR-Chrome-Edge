"use strict";
let ocrWorkerPromise = null;
let processing = Promise.resolve();

async function obtainWorker(tabId) {
  if (ocrWorkerPromise) return ocrWorkerPromise;
  const base = chrome.runtime.getURL("vendor/");
  ocrWorkerPromise = Tesseract.createWorker("tur", 1, {
    workerPath: base + "worker.min.js",
    corePath: base + "core",
    langPath: base + "lang",
    workerBlobURL: false,
    gzip: true,
    cacheMethod: "write",
    logger: status => {
      if (status?.status === "recognizing text") {
        const percent = Math.round((status.progress || 0) * 100);
        if (percent % 20 === 0) {
          void chrome.runtime.sendMessage({
            type: "OCR_PROGRESS", tabId, percent
          }).catch(() => {});
        }
      }
    }
  });
  try { return await ocrWorkerPromise; }
  catch (error) { ocrWorkerPromise = null; throw error; }
}

function copyLocal(text) {
  const element = document.getElementById("clipboard");
  element.value = text;
  element.focus();
  element.select();
  let copied = false;
  try { copied = document.execCommand("copy"); }
  catch (_error) { copied = false; }
  return copied;
}

async function cropVisibleRegion(imageUrl, rect, viewport) {
  const response = await fetch(imageUrl);
  const bitmap = await createImageBitmap(await response.blob());
  const scaleX = bitmap.width / viewport.width;
  const scaleY = bitmap.height / viewport.height;
  const left = Math.max(0, Math.floor(rect.x * scaleX));
  const top = Math.max(0, Math.floor(rect.y * scaleY));
  const width = Math.min(bitmap.width - left, Math.ceil(rect.width * scaleX));
  const height = Math.min(bitmap.height - top, Math.ceil(rect.height * scaleY));
  if (width < 8 || height < 8 || width * height > 36000000) {
    bitmap.close();
    throw new Error("Görüntü alanı çok küçük veya çok büyük.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", {willReadFrequently: true});
  ctx.drawImage(bitmap, left, top, width, height, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error("Görüntü kırpılamadı.")),
    "image/png"
  ));
}

async function process(message) {
  const tabId = message.tabId;
  try {
    const blob = await cropVisibleRegion(message.screenshot, message.rect, message.viewport);
    const worker = await obtainWorker(tabId);
    const result = await worker.recognize(blob, {}, {text: true});
    const text = (result.data?.text || "").replace(/\r\n/g, "\n").trim();
    if (!text) throw new Error("Seçili alanda okunabilir Türkçe metin bulunamadı.");
    const copied = copyLocal(text);
    await chrome.runtime.sendMessage({type: "OCR_FINISHED", tabId, text, copied});
  } catch (error) {
    await chrome.runtime.sendMessage({
      type: "OCR_FAILED", tabId, error: String(error?.message || error)
    }).catch(() => {});
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.target !== "offscreen" || message.type !== "OCR_PROCESS") return;
  sendResponse({accepted:true});
  processing = processing.then(() => process(message));
});
