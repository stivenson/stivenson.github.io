function p(t){const n=t.replace(/^PythonError:\s*/,"").trim(),e=n.split(`
`),r=e.findIndex(s=>s.includes('File "<exec>"'));return r===-1?n:["Traceback (most recent call last):",...e.slice(r)].join(`
`)}function c(t){return t instanceof Error?t.message:String(t)}function d(t){const n=t.replace(/^PythonError:\s*/,"").split(`
`);let e=0;for(n.forEach((s,a)=>{/^\s+File "/.test(s)&&(e=a+1)});e<n.length&&/^\s/.test(n[e]);)e++;return n.slice(e).map(s=>s.trim()).filter(Boolean).join(" ")||t.trim()}function i(t,n){try{t.runPython(n)}catch{}}async function m(t,n){const e=[];let r;try{t.setStdout({batched:a=>e.push(a)}),t.setStderr({batched:a=>e.push(a)}),r=t.runPython("{'__name__': '__main__'}");try{await t.runPythonAsync(n,{globals:r})}catch(a){return i(t,'import matplotlib.pyplot as plt; plt.close("all")'),i(t,"import sys; sys.stdout.flush(); sys.stderr.flush()"),{ok:!1,stdout:e.join(`
`),images:[],error:p(c(a))}}i(t,"import sys; sys.stdout.flush(); sys.stderr.flush()");let s;try{s=t.runPython("_collect_figs()")}catch(a){return{ok:!1,stdout:e.join(`
`),images:[],error:"No se pudo dibujar la figura: "+d(c(a))}}return{ok:!0,stdout:e.join(`
`),images:s?s.split(`
`):[]}}catch(s){return{ok:!1,stdout:e.join(`
`),images:[],error:String(s)}}finally{try{r?.destroy()}catch{}}}var g=`# Se ejecuta una vez al cargar Pyodide en el worker.
# plt.show() no tiene pantalla en el worker: se anula, y _collect_figs()
# convierte cada figura abierta en un PNG en base64 (separados por \\n).
import io, base64
import matplotlib
matplotlib.use("AGG")
import matplotlib.pyplot as plt
plt.style.use("dark_background")
plt.show = lambda *args, **kwargs: None


def _collect_figs():
    try:
        images = []
        for num in plt.get_fignums():
            buf = io.BytesIO()
            plt.figure(num).savefig(buf, format="png", dpi=110, bbox_inches="tight")
            images.append(base64.b64encode(buf.getvalue()).decode("ascii"))
        return "\\n".join(images)
    finally:
        # Aunque savefig falle (p. ej. un titulo con LaTeX invalido), no
        # quedan figuras abiertas para la siguiente ejecucion.
        plt.close("all")
`;const y="0.27.7",u=`https://cdn.jsdelivr.net/pyodide/v${y}/full/`,f=["numpy","scikit-learn","matplotlib"],o=self;let l=null;function h(t){return l||(l=(async()=>{o.postMessage({type:"progress",id:t,message:"Descargando Python (solo la primera vez)…"});const e=await(await import(`${u}pyodide.mjs`)).loadPyodide({indexURL:u});return o.postMessage({type:"progress",id:t,message:"Instalando numpy, scikit-learn y matplotlib…"}),await e.loadPackage(f),e.runPython(g),e})()),l}o.onmessage=async({data:t})=>{if(t.type!=="run")return;const{id:n,code:e}=t;let r;try{r=await h(n)}catch(s){o.postMessage({type:"result",id:n,ok:!1,stdout:"",images:[],error:String(s),loadFailed:!0});return}o.postMessage({type:"started",id:n});try{const s=await m(r,e);o.postMessage({type:"result",id:n,...s})}catch(s){o.postMessage({type:"result",id:n,ok:!1,stdout:"",images:[],error:String(s)})}};
