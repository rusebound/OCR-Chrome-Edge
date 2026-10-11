(() => {
  "use strict";
  if (globalThis.__OCR_EXT_INSTALLED__) {
    globalThis.__OCR_EXT_START__?.();
    return;
  }
  globalThis.__OCR_EXT_INSTALLED__ = true;
  let root = null;
  let statusCard = null;

  function removeOverlay() {
    root?.remove();
    root = null;
  }

  function showToast(message) {
    const previous = document.getElementById("__ocr_extension_status__");
    previous?.remove();
    const elt = document.createElement("div");
    elt.id = "__ocr_extension_status__";
    Object.assign(elt.style, {
      position:"fixed",zIndex:"2147483647",bottom:"22px",right:"22px",
      maxWidth:"500px",background:"#132238",color:"#fff",borderRadius:"12px",
      padding:"13px 18px",font:"14px Segoe UI,sans-serif",
      boxShadow:"0 8px 25px #0005",whiteSpace:"pre-wrap"
    });
    elt.textContent = message;
    document.documentElement.append(elt);
    setTimeout(() => elt.remove(), 5500);
  }

  function tryCopy(text) {
    const editor = document.createElement("textarea");
    editor.value = text;
    Object.assign(editor.style, {
      position:"fixed",left:"0",top:"0",width:"1px",height:"1px",opacity:"0",zIndex:"2147483647"
    });
    document.documentElement.append(editor);
    const previous = document.activeElement;
    editor.focus();
    editor.select();
    let success = false;
    try { success = document.execCommand("copy"); } catch (_error) {}
    editor.remove();
    previous?.focus?.({preventScroll:true});
    return success;
  }

  function showResult(text, wasCopied) {
    statusCard?.remove();
    const wrapper = document.createElement("div");
    statusCard = wrapper;
    Object.assign(wrapper.style, {
      position:"fixed",zIndex:"2147483647",bottom:"18px",right:"18px",width:"min(480px,calc(100vw - 36px))",
      background:"#101a2b",border:"1px solid #405576",color:"#eff6ff",
      padding:"16px",boxSizing:"border-box",borderRadius:"14px",
      boxShadow:"0 12px 36px #0008",font:"13px Segoe UI,sans-serif"
    });
    const heading = document.createElement("div");
    heading.textContent = "OCR — Türkçe metin " + (wasCopied ? "panoya kopyalandı" : "hazır");
    heading.style.cssText = "font-weight:700;font-size:15px;margin-bottom:12px";
    const editor = document.createElement("textarea");
    editor.value = text;
    editor.spellcheck = false;
    Object.assign(editor.style, {
      boxSizing:"border-box",width:"100%",height:"170px",background:"#18283e",color:"#fff",
      border:"1px solid #405576",padding:"9px",font:"14px Segoe UI,sans-serif",
      borderRadius:"7px",resize:"vertical"
    });
    const tools = document.createElement("div");
    tools.style.cssText = "display:flex;gap:8px;margin-top:10px;align-items:center";
    function button(label, action) {
      const el = document.createElement("button");
      el.textContent = label;
      el.style.cssText = "background:#2979ed;color:#fff;border:0;padding:9px 12px;border-radius:8px;cursor:pointer";
      el.addEventListener("click", action);
      return el;
    }
    const copyButton = button("Metni kopyala", () => {
      const copied = tryCopy(editor.value);
      heading.textContent = copied ? "OCR — Metin panoya kopyalandı" : "OCR — Metni seçip Ctrl+C ile kopyalayın";
      if (!copied) {editor.focus();editor.select();}
    });
    const settingsButton = button("Kısayolu değiştir", () => {
      chrome.runtime.sendMessage({type:"OPEN_SHORTCUT_SETTINGS"}).catch(() => {});
    });
    settingsButton.style.background = "#354862";
    const closeButton = button("Kapat", () => wrapper.remove());
    closeButton.style.background = "#354862";
    tools.append(copyButton,settingsButton,closeButton);
    wrapper.append(heading,editor,tools);
    document.documentElement.append(wrapper);
  }

  function begin() {
    if (root) return;
    statusCard?.remove();
    document.getElementById("__ocr_extension_status__")?.remove();
    const overlay = document.createElement("div");
    root = overlay;
    Object.assign(overlay.style, {
      position:"fixed",top:"0",left:"0",width:"100vw",height:"100vh",
      zIndex:"2147483647",cursor:"crosshair",background:"rgba(5,13,32,.19)",
      userSelect:"none",touchAction:"none",pointerEvents:"auto"
    });
    const hint = document.createElement("div");
    hint.textContent = "OCR  •  Fareyle alanı seçin  •  Esc ile iptal";
    hint.style.cssText = "position:fixed;top:14px;left:14px;background:#102039;color:#fff;padding:11px 16px;border-radius:9px;font:14px Segoe UI,sans-serif;box-shadow:0 3px 15px #0005";
    const outline = document.createElement("div");
    outline.style.cssText = "position:absolute;display:none;border:2px solid #2d9eff;background:rgba(60,165,255,.14);box-sizing:border-box;pointer-events:none";
    overlay.append(hint,outline);
    document.documentElement.append(overlay);
    let start = null;
    let current = null;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;

    function draw(x,y) {
      const left = Math.max(0,Math.min(start.x,x));
      const top = Math.max(0,Math.min(start.y,y));
      const width = Math.abs(start.x-x);
      const height = Math.abs(start.y-y);
      Object.assign(outline.style, {
        display:"block",left:left+"px",top:top+"px",width:width+"px",height:height+"px"
      });
      current = {x:left,y:top,width,height};
    }
    overlay.addEventListener("pointerdown", event => {
      if (event.button !== 0) return;
      event.preventDefault(); event.stopPropagation();
      start = {x:event.clientX,y:event.clientY};
      overlay.setPointerCapture(event.pointerId);
      draw(event.clientX,event.clientY);
    },true);
    overlay.addEventListener("pointermove",event=>{
      if (!start) return;
      draw(event.clientX,event.clientY);
    });
    overlay.addEventListener("pointerup",event=>{
      if (!start) return;
      draw(event.clientX,event.clientY);
      event.preventDefault();event.stopPropagation();
      const rect = current;
      start = null;
      removeOverlay();
      if (rect.width < 8 || rect.height < 8) {
        showToast("Seçilen alan çok küçük; tekrar deneyin.");
        return;
      }
      // Wait for browser to repaint before capture.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        showToast("OCR: Türkçe metin tanınıyor…");
        chrome.runtime.sendMessage({
          type:"OCR_CAPTURE",rect,viewport:{width:viewWidth,height:viewHeight}
        }).catch(error=>showToast("OCR başlatılamadı: "+String(error)));
      }));
    });
    function cancel(event) {
      if (event.key !== "Escape") return;
      event.stopPropagation();event.preventDefault();
      document.removeEventListener("keydown",cancel,true);
      removeOverlay();
    }
    document.addEventListener("keydown",cancel,true);
    // Clean up listener when the selection closes.
    const observe = new MutationObserver(()=>{
      if (!root || !document.documentElement.contains(overlay)) {
        document.removeEventListener("keydown",cancel,true);
        observe.disconnect();
      }
    });
    observe.observe(document.documentElement,{childList:true});
  }

  chrome.runtime.onMessage.addListener(message=>{
    if (!message) return;
    if (message.type === "OCR_FINISHED") {
      const copied = message.copied || tryCopy(message.text);
      document.getElementById("__ocr_extension_status__")?.remove();
      showResult(message.text,copied);
    } else if (message.type === "OCR_FAILED") {
      showToast("OCR hatası: " + (message.error || "Bilinmeyen hata"));
    } else if (message.type === "OCR_PROGRESS") {
      // Do not constantly recreate the visual result window.
    }
  });

  globalThis.__OCR_EXT_START__ = begin;
  begin();
})();