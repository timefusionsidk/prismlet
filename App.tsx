import {useEffect,useRef,useState} from 'react';
import {Download,Sparkles,RotateCcw,Pencil,ShieldCheck,AlertTriangle,Square} from 'lucide-react';
type St='idle'|'downloading'|'loading'|'generating'|'done'|'error';
const EX=['A lighthouse on a cliff at dawn, soft watercolor, pale pink sky','A cozy reading nook with a sleeping cat and rain on the window, warm lamp light','A paper-cut mountain landscape in indigo and cream, layered depth'];
const mb=(b:number)=>(b/1048576).toFixed(0)+' MB';
function AdSlot(){const pub=import.meta.env.VITE_ADSENSE_PUBLISHER,slot=import.meta.env.VITE_ADSENSE_SLOT;const ok=pub&&slot;
 useEffect(()=>{if(!ok)return;const s=document.createElement('script');s.async=true;s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+pub;document.head.appendChild(s);
  s.onload=()=>{try{((window as any).adsbygoogle=(window as any).adsbygoogle||[]).push({})}catch{}}},[ok,pub]);
 return ok?<ins className="adsbygoogle block my-8" data-ad-client={pub} data-ad-slot={slot} data-ad-format="auto"/>:<div className="ui my-8 text-xs text-center border border-dashed rounded-xl p-6" style={{borderColor:'var(--line)',color:'var(--mut)'}}>Ad placeholder (ads not configured)</div>}
export default function App(){
 const [gpu,setGpu]=useState<'checking'|'ok'|string>('checking');
 const [prompt,setPrompt]=useState('');const [st,setSt]=useState<St>('idle');
 const [dl,setDl]=useState<[number,number]>([0,0]);const [gen,setGen]=useState<[number,number]>([0,0]);
 const [img,setImg]=useState<{url:string;w:number;h:number;prompt:string}|null>(null);const [err,setErr]=useState('');
 const w=useRef<Worker|null>(null);const box=useRef<HTMLTextAreaElement>(null);const cur=useRef('');
 useEffect(()=>{(async()=>{
  if(!window.isSecureContext)return setGpu('This page needs HTTPS.');
  if(!('gpu' in navigator))return setGpu('This browser does not expose WebGPU. Try recent desktop Chrome or Edge.');
  try{const a=await (navigator as any).gpu.requestAdapter();setGpu(a?'ok':'No GPU adapter is available to this browser.')}catch{setGpu('WebGPU failed to initialise.')}})()},[]);
 const spawn=()=>{w.current?.terminate();const k=new Worker(new URL('./worker.ts',import.meta.url),{type:'module'});
  k.onmessage=(e)=>{const d=e.data;
   if(d.type==='dl'){setDl([d.loaded,d.total]);setSt(d.loaded>=d.total?'loading':'downloading')}
   else if(d.type==='ready')setSt('generating');
   else if(d.type==='gen')setGen([d.done,d.total]);
   else if(d.type==='image'){setImg(o=>{if(o)URL.revokeObjectURL(o.url);return{url:URL.createObjectURL(d.blob),w:d.w,h:d.h,prompt:cur.current}});setSt('done')}
   else if(d.type==='error'){setErr(d.message);setSt('error')}};
  k.onerror=()=>{setErr('The generator crashed (possibly out of GPU memory).');setSt('error')};w.current=k;return k};
 const run=()=>{if(!prompt.trim()||['downloading','loading','generating'].includes(st))return;setErr('');setGen([0,0]);cur.current=prompt.trim();
  setSt('downloading');(w.current??spawn()).postMessage({type:'generate',prompt:cur.current})};
 const stop=()=>{w.current?.terminate();w.current=null;setSt('idle')};
 const busy=['downloading','loading','generating'].includes(st);
 const save=()=>{if(!img)return;const a=document.createElement('a');a.href=img.url;a.download=(img.prompt.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)||'image')+'.png';a.click()};
 const label={downloading:'Downloading model'+(dl[1]?` — ${mb(dl[0])} / ${mb(dl[1])}`:'…'),loading:'Loading model onto your GPU (compiling)…',generating:gen[1]?`Generating — step ${gen[0]} of ${gen[1]}`:'Starting generation…'} as Record<string,string>;
 const pct=st==='downloading'&&dl[1]?dl[0]/dl[1]*100:st==='generating'&&gen[1]?gen[0]/gen[1]*100:null;
 const Sec=({id,t,children}:{id?:string;t:string;children:any})=><section id={id} className="max-w-3xl mx-auto px-5 py-10"><h2 className="text-3xl mb-3">{t}</h2><div className="ui leading-relaxed space-y-3" style={{color:'var(--mut)'}}>{children}</div></section>;
 return<div>
 <nav className="ui sticky top-0 z-10 flex items-center justify-between px-5 h-14 backdrop-blur" style={{background:'color-mix(in srgb,var(--bg) 85%,transparent)',borderBottom:'1px solid var(--line)'}}>
  <a href="#" className="font-bold flex items-center gap-2"><img src="/favicon.svg" width="24" height="24" alt=""/>Prismlet</a>
  <div className="flex gap-4 text-sm"><a href="#how">How it works</a><a href="#faq">FAQ</a><a href="#privacy">Privacy</a></div></nav>
 <header className="max-w-3xl mx-auto px-5 pt-14 pb-6"><h1 className="text-4xl sm:text-6xl leading-tight">Imagine it. Generate it. <span style={{color:'var(--ac)'}}>Keep it private.</span></h1>
  <p className="ui mt-4 text-lg" style={{color:'var(--mut)'}}>Create images from a text prompt using your own device. No account and no image-generation API.</p></header>
 <main className="max-w-3xl mx-auto px-5 ui">
  <div className="card p-5 space-y-4">
   {gpu==='checking'?<p role="status">Checking your device…</p>:gpu!=='ok'?
    <div role="alert" className="flex gap-3"><AlertTriangle className="shrink-0"/><div><b>Local generation can’t run here.</b><p>{gpu} Nothing is sent to a server as a fallback — try a current desktop browser with WebGPU and a capable GPU.</p></div></div>
    :<p className="text-sm" style={{color:'var(--mut)'}}>WebGPU adapter found. This doesn’t guarantee enough GPU memory. First run downloads roughly 1–2 GB of model files (exact size shown once download starts); they’re cached in your browser afterwards.</p>}
   <label htmlFor="p" className="block font-semibold">Prompt</label>
   <textarea id="p" ref={box} value={prompt} onChange={e=>setPrompt(e.target.value)} rows={4} placeholder="Describe the image you want…" className="w-full rounded-xl p-3 border bg-transparent" style={{borderColor:'var(--line)'}}/>
   <div className="flex flex-wrap gap-2">{EX.map(x=><button key={x} className="btn btn2 text-sm text-left" onClick={()=>setPrompt(x)}>{x.split(',')[0]}</button>)}</div>
   <div className="flex flex-wrap gap-3 items-center">
    <button className="btn" disabled={gpu!=='ok'||busy||!prompt.trim()} onClick={run}><Sparkles size={18}/>Generate image</button>
    {busy&&<button className="btn btn2" onClick={stop}><Square size={16}/>Cancel (stops the worker)</button>}
    <button className="btn btn2" disabled={busy} onClick={()=>{setPrompt('');setErr('');setSt('idle')}}><RotateCcw size={16}/>Reset</button></div>
   <p className="text-sm flex gap-2" style={{color:'var(--mut)'}}><ShieldCheck size={18} className="shrink-0"/>Your prompts and images are generated on your device. The model is downloaded to your browser for local processing.</p>
   <div role="status" aria-live="polite">{busy&&<div><p>{label[st]}</p><div className="h-2 rounded mt-2 overflow-hidden" style={{background:'var(--line)'}}><div className="h-2" style={{background:'var(--ac)',width:(pct??100)+'%',opacity:pct==null?.4:1}}/></div></div>}</div>
   {st==='error'&&<div role="alert"><p><b>Something went wrong.</b> {err}</p><button className="btn mt-2" onClick={()=>{w.current?.terminate();w.current=null;run()}}>Reset and retry</button></div>}
  </div>
  {img&&<div className="card p-5 mt-6"><img src={img.url} width={img.w} height={img.h} alt={'Generated image: '+img.prompt} className="w-full max-w-md mx-auto rounded-xl"/>
   <p className="mt-3 text-sm" style={{color:'var(--mut)'}}>“{img.prompt}” · {img.w}×{img.h}px · seed not controllable with this model</p>
   <div className="flex flex-wrap gap-3 mt-3"><button className="btn" onClick={save}><Download size={18}/>Download PNG</button><button className="btn btn2" disabled={busy} onClick={run}><Sparkles size={16}/>Generate again</button><button className="btn btn2" onClick={()=>box.current?.focus()}><Pencil size={16}/>Edit prompt</button><button className="btn btn2" onClick={()=>{URL.revokeObjectURL(img.url);setImg(null);setPrompt('');setSt('idle')}}>New session</button></div></div>}
  <AdSlot/>
 </main>
 <Sec id="how" t="How it works"><p>Prismlet downloads an open image model (Janus-Pro-1B) into your browser and runs it on your GPU through WebGPU. Your prompt never goes to an inference server.</p><p>Output is a fixed 384×384 PNG. Only prompt and download are offered because the model pipeline exposes no other controls.</p></Sec>
 <Sec id="limits" t="Device requirements & limitations"><p>Needs HTTPS, WebGPU (recent desktop Chrome or Edge recommended) and a capable GPU. Browsers can’t reliably report VRAM, so a supported device can still run out of memory. Phones are unlikely to work. Quality is modest compared with large cloud models.</p></Sec>
 <Sec id="faq" t="FAQ"><p><b>Is it free?</b> Yes to use. Model files are fetched from Hugging Face and use your bandwidth. <b>Offline?</b> Not claimed. <b>Content filter?</b> None is built in; see Terms.</p></Sec>
 <div className="max-w-3xl mx-auto px-5"><AdSlot/></div>
 <Sec id="privacy" t="Privacy Policy"><p>Prompts and images stay in your browser and are never uploaded. There is no account. Your browser requests this site, model files (Hugging Face) and, if configured, ads (which receive no prompts or images). No analytics are included by default. Model files are cached in browser storage; clear site data to remove them.</p></Sec>
 <Sec id="terms" t="Terms of Use"><p>Don’t generate unlawful content, or content prohibited by the DeepSeek Model License Attachment A (e.g. harassment, deception, harm to minors). You are responsible for outputs. The app cannot reliably filter unsafe prompts. Model: Janus-Pro-1B by DeepSeek, ONNX weights by onnx-community, run with Transformers.js.</p></Sec>
 <footer className="ui text-center text-sm py-10" style={{color:'var(--mut)'}}>© Prismlet · a Time Fusions mini app</footer></div>}
