import { W as n, __tla as __tla_0 } from "./index-PTpXfjMN.js";
let s;
let __tla = Promise.all([
    (()=>{
        try {
            return __tla_0;
        } catch  {}
    })()
]).then(async ()=>{
    s = class extends n {
        async show(e) {
            if (typeof document < "u") {
                let a = 2e3;
                e.duration && (a = e.duration === "long" ? 3500 : 2e3);
                const t = document.createElement("pwa-toast");
                t.duration = a, t.message = e.text, document.body.appendChild(t);
            }
        }
    };
});
export { s as ToastWeb, __tla };
