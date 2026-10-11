import {mount,element,setMessage,setProgress,openPdf,downloadFile,safeStem} from "./common.js";
const app=mount({tool:"OCR-Chrome-Edge",title:"Türkçe OCR",subtitle:"Görsel veya PDF sayfasındaki Türkçe yazıyı tarayıcınızda tanıyın.",description:"Görsel ya da PDF seçin, isterseniz fareyle alanı işaretleyin, metni tanıyıp kopyalayın. Kurulum ve yönetici izni gerekmez.",accept:".pdf,image/png,image/jpeg,image/webp,image/bmp",action:"Türkçe metni tanı",limit:"Görsel/PDF · 50 MB",features:["Görüntü/PDF sayfası seçilir, hiçbir belge sunucuya gönderilmez.","İsteğe bağlı dikdörtgen alan seçimi; seçim yapılmazsa tam sayfa.","Tesseract Türkçe dil paketi ve motoru bu sitede barındırılır.","Tanınan metin düzenlenebilir ve kullanıcı tarafından kopyalanabilir.","Korumalı ekranları çekmez; yalnızca seçilen dosyayı işler."]});
const extra=element("extra");
extra.innerHTML='<div class="option" id="pagesBox" hidden><label for="pageNumber">PDF sayfası</label><input id="pageNumber" type="number" min="1" value="1"></div><div class="canvas-wrap" id="canvasBox" hidden><canvas id="preview" aria-label="OCR alan seçimi"></canvas></div><p class="note" id="drawHint" hidden>Fareyle bir alan çizerek yalnızca o alanı tanıtabilirsiniz. Alanı sıfırlamak için “Seçimi temizle” kullanın.</p><button id="clearSelection" class="secondary" type="button" hidden>Seçimi temizle</button><div class="option"><label for="recognized">Tanınan Türkçe metin</label><textarea id="recognized" placeholder="İşlem sonrasında metin burada görünecek."></textarea></div><div class="actions"><button id="copy" type="button" class="secondary">Metni kopyala</button><button id="saveText" type="button" class="secondary">TXT olarak kaydet</button></div>';
const input=element("pageNumber"), display=element("preview"), context=display.getContext("2d",{willReadFrequently:false});
const source=document.createElement("canvas");
const sourceContext=source.getContext("2d",{willReadFrequently:true});
let pdf=null, worker=null, region=null,dragStart=null;
function draw() {
 if(!source.width)return;
 const maxW=950,maxH=960,ratio=Math.min(maxW/source.width,maxH/source.height,1);
 display.width=Math.max(1,Math.round(source.width*ratio));
 display.height=Math.max(1,Math.round(source.height*ratio));
 context.clearRect(0,0,display.width,display.height);
 context.drawImage(source,0,0,display.width,display.height);
 if(region){
  const x=region.x*ratio,y=region.y*ratio,w=region.w*ratio,h=region.h*ratio;
  context.fillStyle="rgba(53,136,245,0.17)";context.fillRect(x,y,w,h);
  context.strokeStyle="#9bd4ff";context.lineWidth=2;context.strokeRect(x,y,w,h);
 }
}
function pt(ev) {
 const b=display.getBoundingClientRect();
 return{x:Math.max(0,Math.min(source.width,(ev.clientX-b.left)*source.width/b.width)),y:Math.max(0,Math.min(source.height,(ev.clientY-b.top)*source.height/b.height))};
}
display.addEventListener("pointerdown",ev=>{dragStart=pt(ev);display.setPointerCapture(ev.pointerId);});
display.addEventListener("pointermove",ev=>{if(!dragStart)return;const p=pt(ev);region={x:Math.min(p.x,dragStart.x),y:Math.min(p.y,dragStart.y),w:Math.abs(p.x-dragStart.x),h:Math.abs(p.y-dragStart.y)};draw();});
display.addEventListener("pointerup",()=>{dragStart=null;if(region?.w<8||region?.h<8)region=null;draw();});
element("clearSelection").addEventListener("click",()=>{region=null;draw();});
async function renderSelected(file) {
 region=null;setProgress(0); element("recognized").value="";
 if(pdf){await pdf.destroy().catch(()=>{});pdf=null;}
 if(file.name.toLowerCase().endsWith(".pdf")){
  pdf=await openPdf(file);
  if(pdf.numPages>100)throw new Error("OCR web sürümünde en fazla 100 PDF sayfası görüntülenebilir.");
  input.max=String(pdf.numPages); input.value="1";
  element("pagesBox").hidden=false;
  await renderPdfPage();
 }else{
  element("pagesBox").hidden=true;
  const img=await createImageBitmap(file);
  const scale=Math.min(1,Math.sqrt(22_000_000/(img.width*img.height)));
  source.width=Math.max(1,Math.floor(img.width*scale)); source.height=Math.max(1,Math.floor(img.height*scale));
  sourceContext.drawImage(img,0,0,source.width,source.height);img.close();
 }
 draw();element("canvasBox").hidden=false;element("drawHint").hidden=false;element("clearSelection").hidden=false;
 setMessage("Önizleme hazır. İsterseniz alan seçin, ardından Türkçe metni tanıyın.");
}
async function renderPdfPage(){
 const index=Number(input.value);
 if(!pdf||!Number.isInteger(index)||index<1||index>pdf.numPages)throw new Error("Geçerli PDF sayfası seçin.");
 const page=await pdf.getPage(index);
 const v0=page.getViewport({scale:1});
 const scale=Math.min(2,Math.sqrt(14_000_000/(v0.width*v0.height)));
 const view=page.getViewport({scale});
 source.width=Math.ceil(view.width);source.height=Math.ceil(view.height);
 await page.render({canvasContext:sourceContext,viewport:view}).promise;
 region=null;page.cleanup();draw();
}
input.addEventListener("change",()=>renderPdfPage().then(()=>setMessage("PDF sayfası hazır. Alan seçebilirsiniz.")).catch(e=>setMessage(e.message,"error")));
app.onSelected=renderSelected;
app.run=async file=>{
 if(!source.width)throw new Error("Lütfen önce görsel önizlemesini açın.");
 if(!window.Tesseract?.createWorker) throw new Error("Türkçe OCR motoru yüklenemedi. Kurumsal ağ erişimi engelliyor olabilir.");
 setMessage("Türkçe OCR motoru hazırlanıyor; ilk açılışta dil modeli yüklenebilir...");
 if(!worker){
  worker=await window.Tesseract.createWorker("tur",1,{
   workerPath:new URL("./vendor/worker.min.js",location.href).href,
   corePath:new URL("./vendor/core",location.href).href,
   langPath:new URL("./vendor/lang",location.href).href,
   workerBlobURL:false, gzip:true, cacheMethod:"none",
   logger:m=>{if(m?.status==="recognizing text")setProgress(Math.round((m.progress||0)*100));}
  });
 }
 const crop=document.createElement("canvas");
 const r=region?.w>8&&region?.h>8?region:{x:0,y:0,w:source.width,h:source.height};
 crop.width=Math.ceil(r.w);crop.height=Math.ceil(r.h);
 crop.getContext("2d").drawImage(source,r.x,r.y,r.w,r.h,0,0,crop.width,crop.height);
 const blob=await new Promise((resolve,reject)=>crop.toBlob(v=>v?resolve(v):reject(new Error("Görsel oluşturulamadı.")),"image/png"));
 const result=await worker.recognize(blob,{}, {text:true});
 const text=(result.data?.text||"").trim();
 if(!text){setMessage("Okunabilir Türkçe metin bulunamadı. Daha net bir alan seçin.","error");return;}
 element("recognized").value=text;setProgress(100);
 setMessage("Metin tarayıcınızda tanındı. Kontrol edip kopyalayabilirsiniz.","ok");
};
element("copy").addEventListener("click",async()=>{
 const t=element("recognized").value;
 if(!t.trim()){setMessage("Kopyalanacak metin yok.","error");return;}
 try{await navigator.clipboard.writeText(t);setMessage("Metin panoya kopyalandı.","ok");}
 catch{element("recognized").select();document.execCommand("copy");setMessage("Metin seçildi. Ctrl+C ile kopyalayın.","ok");}
});
element("saveText").addEventListener("click",()=>{const t=element("recognized").value;if(!t.trim())return setMessage("Kaydedilecek metin yok.","error");downloadFile(new Blob([t],{type:"text/plain;charset=utf-8"}),safeStem(app.file?.name)+".txt");});
