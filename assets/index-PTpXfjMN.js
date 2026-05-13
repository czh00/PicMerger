let Y, q, ye;
let __tla = (async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);
        new MutationObserver((s)=>{
            for (const o of s)if (o.type === "childList") for (const l of o.addedNodes)l.tagName === "LINK" && l.rel === "modulepreload" && i(l);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function n(s) {
            const o = {};
            return s.integrity && (o.integrity = s.integrity), s.referrerPolicy && (o.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? o.credentials = "include" : s.crossOrigin === "anonymous" ? o.credentials = "omit" : o.credentials = "same-origin", o;
        }
        function i(s) {
            if (s.ep) return;
            s.ep = !0;
            const o = n(s);
            fetch(s.href, o);
        }
    })();
    const ue = "modulepreload", ge = function(e, t) {
        return new URL(e, t).href;
    }, K = {}, F = function(t, n, i) {
        let s = Promise.resolve();
        if (n && n.length > 0) {
            let l = function(v) {
                return Promise.all(v.map((u)=>Promise.resolve(u).then((h)=>({
                            status: "fulfilled",
                            value: h
                        }), (h)=>({
                            status: "rejected",
                            reason: h
                        }))));
            };
            const c = document.getElementsByTagName("link"), d = document.querySelector("meta[property=csp-nonce]"), g = d?.nonce || d?.getAttribute("nonce");
            s = l(n.map((v)=>{
                if (v = ge(v, i), v in K) return;
                K[v] = !0;
                const u = v.endsWith(".css"), h = u ? '[rel="stylesheet"]' : "";
                if (!!i) for(let p = c.length - 1; p >= 0; p--){
                    const f = c[p];
                    if (f.href === v && (!u || f.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${v}"]${h}`)) return;
                const m = document.createElement("link");
                if (m.rel = u ? "stylesheet" : ue, u || (m.as = "script"), m.crossOrigin = "", m.href = v, g && m.setAttribute("nonce", g), document.head.appendChild(m), u) return new Promise((p, f)=>{
                    m.addEventListener("load", p), m.addEventListener("error", ()=>f(new Error(`Unable to preload CSS for ${v}`)));
                });
            }));
        }
        function o(l) {
            const c = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (c.payload = l, window.dispatchEvent(c), !c.defaultPrevented) throw l;
        }
        return s.then((l)=>{
            for (const c of l || [])c.status === "rejected" && o(c.reason);
            return t().catch(o);
        });
    };
    var U;
    (function(e) {
        e.Unimplemented = "UNIMPLEMENTED", e.Unavailable = "UNAVAILABLE";
    })(U || (U = {}));
    class D extends Error {
        constructor(t, n, i){
            super(t), this.message = t, this.code = n, this.data = i;
        }
    }
    const he = (e)=>{
        var t, n;
        return e?.androidBridge ? "android" : !((n = (t = e?.webkit) === null || t === void 0 ? void 0 : t.messageHandlers) === null || n === void 0) && n.bridge ? "ios" : "web";
    }, me = (e)=>{
        const t = e.CapacitorCustomPlatform || null, n = e.Capacitor || {}, i = n.Plugins = n.Plugins || {}, s = ()=>t !== null ? t.name : he(e), o = ()=>s() !== "web", l = (u)=>{
            const h = g.get(u);
            return !!(h?.platforms.has(s()) || c(u));
        }, c = (u)=>{
            var h;
            return (h = n.PluginHeaders) === null || h === void 0 ? void 0 : h.find((b)=>b.name === u);
        }, d = (u)=>e.console.error(u), g = new Map, v = (u, h = {})=>{
            const b = g.get(u);
            if (b) return console.warn(`Capacitor plugin "${u}" already registered. Cannot register plugins twice.`), b.proxy;
            const m = s(), p = c(u);
            let f;
            const E = async ()=>(!f && m in h ? f = typeof h[m] == "function" ? f = await h[m]() : f = h[m] : t !== null && !f && "web" in h && (f = typeof h.web == "function" ? f = await h.web() : f = h.web), f), R = (w, y)=>{
                var S, M;
                if (p) {
                    const P = p?.methods.find((L)=>y === L.name);
                    if (P) return P.rtype === "promise" ? (L)=>n.nativePromise(u, y.toString(), L) : (L, $)=>n.nativeCallback(u, y.toString(), L, $);
                    if (w) return (S = w[y]) === null || S === void 0 ? void 0 : S.bind(w);
                } else {
                    if (w) return (M = w[y]) === null || M === void 0 ? void 0 : M.bind(w);
                    throw new D(`"${u}" plugin is not implemented on ${m}`, U.Unimplemented);
                }
            }, A = (w)=>{
                let y;
                const S = (...M)=>{
                    const P = E().then((L)=>{
                        const $ = R(L, w);
                        if ($) {
                            const O = $(...M);
                            return y = O?.remove, O;
                        } else throw new D(`"${u}.${w}()" is not implemented on ${m}`, U.Unimplemented);
                    });
                    return w === "addListener" && (P.remove = async ()=>y()), P;
                };
                return S.toString = ()=>`${w.toString()}() { [capacitor code] }`, Object.defineProperty(S, "name", {
                    value: w,
                    writable: !1,
                    configurable: !1
                }), S;
            }, G = A("addListener"), N = A("removeListener"), de = (w, y)=>{
                const S = G({
                    eventName: w
                }, y), M = async ()=>{
                    const L = await S;
                    N({
                        eventName: w,
                        callbackId: L
                    }, y);
                }, P = new Promise((L)=>S.then(()=>L({
                            remove: M
                        })));
                return P.remove = async ()=>{
                    console.warn("Using addListener() without 'await' is deprecated."), await M();
                }, P;
            }, _ = new Proxy({}, {
                get (w, y) {
                    switch(y){
                        case "$$typeof":
                            return;
                        case "toJSON":
                            return ()=>({});
                        case "addListener":
                            return p ? de : G;
                        case "removeListener":
                            return N;
                        default:
                            return A(y);
                    }
                }
            });
            return i[u] = _, g.set(u, {
                name: u,
                proxy: _,
                platforms: new Set([
                    ...Object.keys(h),
                    ...p ? [
                        m
                    ] : []
                ])
            }), _;
        };
        return n.convertFileSrc || (n.convertFileSrc = (u)=>u), n.getPlatform = s, n.handleError = d, n.isNativePlatform = o, n.isPluginAvailable = l, n.registerPlugin = v, n.Exception = D, n.DEBUG = !!n.DEBUG, n.isLoggingEnabled = !!n.isLoggingEnabled, n;
    }, fe = (e)=>e.Capacitor = me(e), H = fe(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}), k = H.registerPlugin;
    q = class {
        constructor(){
            this.listeners = {}, this.retainedEventArguments = {}, this.windowListeners = {};
        }
        addListener(t, n) {
            let i = !1;
            this.listeners[t] || (this.listeners[t] = [], i = !0), this.listeners[t].push(n);
            const o = this.windowListeners[t];
            o && !o.registered && this.addWindowListener(o), i && this.sendRetainedArgumentsForEvent(t);
            const l = async ()=>this.removeListener(t, n);
            return Promise.resolve({
                remove: l
            });
        }
        async removeAllListeners() {
            this.listeners = {};
            for(const t in this.windowListeners)this.removeWindowListener(this.windowListeners[t]);
            this.windowListeners = {};
        }
        notifyListeners(t, n, i) {
            const s = this.listeners[t];
            if (!s) {
                if (i) {
                    let o = this.retainedEventArguments[t];
                    o || (o = []), o.push(n), this.retainedEventArguments[t] = o;
                }
                return;
            }
            s.forEach((o)=>o(n));
        }
        hasListeners(t) {
            var n;
            return !!(!((n = this.listeners[t]) === null || n === void 0) && n.length);
        }
        registerWindowListener(t, n) {
            this.windowListeners[n] = {
                registered: !1,
                windowEventName: t,
                pluginEventName: n,
                handler: (i)=>{
                    this.notifyListeners(n, i);
                }
            };
        }
        unimplemented(t = "not implemented") {
            return new H.Exception(t, U.Unimplemented);
        }
        unavailable(t = "not available") {
            return new H.Exception(t, U.Unavailable);
        }
        async removeListener(t, n) {
            const i = this.listeners[t];
            if (!i) return;
            const s = i.indexOf(n);
            this.listeners[t].splice(s, 1), this.listeners[t].length || this.removeWindowListener(this.windowListeners[t]);
        }
        addWindowListener(t) {
            window.addEventListener(t.windowEventName, t.handler), t.registered = !0;
        }
        removeWindowListener(t) {
            t && (window.removeEventListener(t.windowEventName, t.handler), t.registered = !1);
        }
        sendRetainedArgumentsForEvent(t) {
            const n = this.retainedEventArguments[t];
            n && (delete this.retainedEventArguments[t], n.forEach((i)=>{
                this.notifyListeners(t, i);
            }));
        }
    };
    const Z = (e)=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape), z = (e)=>e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    class pe extends q {
        async getCookies() {
            const t = document.cookie, n = {};
            return t.split(";").forEach((i)=>{
                if (i.length <= 0) return;
                let [s, o] = i.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
                s = z(s).trim(), o = z(o).trim(), n[s] = o;
            }), n;
        }
        async setCookie(t) {
            try {
                const n = Z(t.key), i = Z(t.value), s = t.expires ? `; expires=${t.expires.replace("expires=", "")}` : "", o = (t.path || "/").replace("path=", ""), l = t.url != null && t.url.length > 0 ? `domain=${t.url}` : "";
                document.cookie = `${n}=${i || ""}${s}; path=${o}; ${l};`;
            } catch (n) {
                return Promise.reject(n);
            }
        }
        async deleteCookie(t) {
            try {
                document.cookie = `${t.key}=; Max-Age=0`;
            } catch (n) {
                return Promise.reject(n);
            }
        }
        async clearCookies() {
            try {
                const t = document.cookie.split(";") || [];
                for (const n of t)document.cookie = n.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
            } catch (t) {
                return Promise.reject(t);
            }
        }
        async clearAllCookies() {
            try {
                await this.clearCookies();
            } catch (t) {
                return Promise.reject(t);
            }
        }
    }
    k("CapacitorCookies", {
        web: ()=>new pe
    });
    let ve, be, we;
    ve = async (e)=>new Promise((t, n)=>{
            const i = new FileReader;
            i.onload = ()=>{
                const s = i.result;
                t(s.indexOf(",") >= 0 ? s.split(",")[1] : s);
            }, i.onerror = (s)=>n(s), i.readAsDataURL(e);
        });
    be = (e = {})=>{
        const t = Object.keys(e);
        return Object.keys(e).map((s)=>s.toLocaleLowerCase()).reduce((s, o, l)=>(s[o] = e[t[l]], s), {});
    };
    we = (e, t = !0)=>e ? Object.entries(e).reduce((i, s)=>{
            const [o, l] = s;
            let c, d;
            return Array.isArray(l) ? (d = "", l.forEach((g)=>{
                c = t ? encodeURIComponent(g) : g, d += `${o}=${c}&`;
            }), d.slice(0, -1)) : (c = t ? encodeURIComponent(l) : l, d = `${o}=${c}`), `${i}&${d}`;
        }, "").substr(1) : null;
    ye = (e, t = {})=>{
        const n = Object.assign({
            method: e.method || "GET",
            headers: e.headers
        }, t), s = be(e.headers)["content-type"] || "";
        if (typeof e.data == "string") n.body = e.data;
        else if (s.includes("application/x-www-form-urlencoded")) {
            const o = new URLSearchParams;
            for (const [l, c] of Object.entries(e.data || {}))o.set(l, c);
            n.body = o.toString();
        } else if (s.includes("multipart/form-data") || e.data instanceof FormData) {
            const o = new FormData;
            if (e.data instanceof FormData) e.data.forEach((c, d)=>{
                o.append(d, c);
            });
            else for (const c of Object.keys(e.data))o.append(c, e.data[c]);
            n.body = o;
            const l = new Headers(n.headers);
            l.delete("content-type"), n.headers = l;
        } else (s.includes("application/json") || typeof e.data == "object") && (n.body = JSON.stringify(e.data));
        return n;
    };
    class Ee extends q {
        async request(t) {
            const n = ye(t, t.webFetchExtra), i = we(t.params, t.shouldEncodeUrlParams), s = i ? `${t.url}?${i}` : t.url, o = await fetch(s, n), l = o.headers.get("content-type") || "";
            let { responseType: c = "text" } = o.ok ? t : {};
            l.includes("application/json") && (c = "json");
            let d, g;
            switch(c){
                case "arraybuffer":
                case "blob":
                    g = await o.blob(), d = await ve(g);
                    break;
                case "json":
                    d = await o.json();
                    break;
                case "document":
                case "text":
                default:
                    d = await o.text();
            }
            const v = {};
            return o.headers.forEach((u, h)=>{
                v[h] = u;
            }), {
                data: d,
                headers: v,
                status: o.status,
                url: o.url
            };
        }
        async get(t) {
            return this.request(Object.assign(Object.assign({}, t), {
                method: "GET"
            }));
        }
        async post(t) {
            return this.request(Object.assign(Object.assign({}, t), {
                method: "POST"
            }));
        }
        async put(t) {
            return this.request(Object.assign(Object.assign({}, t), {
                method: "PUT"
            }));
        }
        async patch(t) {
            return this.request(Object.assign(Object.assign({}, t), {
                method: "PATCH"
            }));
        }
        async delete(t) {
            return this.request(Object.assign(Object.assign({}, t), {
                method: "DELETE"
            }));
        }
    }
    k("CapacitorHttp", {
        web: ()=>new Ee
    });
    var J;
    (function(e) {
        e.Dark = "DARK", e.Light = "LIGHT", e.Default = "DEFAULT";
    })(J || (J = {}));
    var X;
    (function(e) {
        e.StatusBar = "StatusBar", e.NavigationBar = "NavigationBar";
    })(X || (X = {}));
    class Le extends q {
        async setStyle() {
            this.unavailable("not available for web");
        }
        async setAnimation() {
            this.unavailable("not available for web");
        }
        async show() {
            this.unavailable("not available for web");
        }
        async hide() {
            this.unavailable("not available for web");
        }
    }
    k("SystemBars", {
        web: ()=>new Le
    });
    function Ce(e) {
        e.CapacitorUtils.Synapse = new Proxy({}, {
            get (t, n) {
                return new Proxy({}, {
                    get (i, s) {
                        return (o, l, c)=>{
                            const d = e.Capacitor.Plugins[n];
                            if (d === void 0) {
                                c(new Error(`Capacitor plugin ${n} not found`));
                                return;
                            }
                            if (typeof d[s] != "function") {
                                c(new Error(`Method ${s} not found in Capacitor plugin ${n}`));
                                return;
                            }
                            (async ()=>{
                                try {
                                    const g = await d[s](o);
                                    l(g);
                                } catch (g) {
                                    c(g);
                                }
                            })();
                        };
                    }
                });
            }
        });
    }
    function Se(e) {
        e.CapacitorUtils.Synapse = new Proxy({}, {
            get (t, n) {
                return e.cordova.plugins[n];
            }
        });
    }
    function Ie(e = !1) {
        typeof window > "u" || (window.CapacitorUtils = window.CapacitorUtils || {}, window.Capacitor !== void 0 && !e ? Ce(window) : window.cordova !== void 0 && Se(window));
    }
    var B;
    (function(e) {
        e.Documents = "DOCUMENTS", e.Data = "DATA", e.Library = "LIBRARY", e.Cache = "CACHE", e.External = "EXTERNAL", e.ExternalStorage = "EXTERNAL_STORAGE", e.ExternalCache = "EXTERNAL_CACHE", e.LibraryNoCloud = "LIBRARY_NO_CLOUD", e.Temporary = "TEMPORARY";
    })(B || (B = {}));
    (function(e) {
        e.UTF8 = "utf8", e.ASCII = "ascii", e.UTF16 = "utf16";
    })(Y || (Y = {}));
    const ee = k("Filesystem", {
        web: ()=>F(()=>import("./web-ZaLXRn-m.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                }), [], import.meta.url).then((e)=>new e.FilesystemWeb)
    });
    Ie();
    const xe = k("Share", {
        web: ()=>F(()=>import("./web-CuGYbbfi.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                }), [], import.meta.url).then((e)=>new e.ShareWeb)
    }), Me = k("Toast", {
        web: ()=>F(()=>import("./web-CGI1lWjP.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                }), [], import.meta.url).then((e)=>new e.ToastWeb)
    });
    async function Pe() {
        console.warn("Rust WASM 模組未尋獲，系統將自動切換為 JS Canvas 引擎進行處理。");
    }
    function Ae() {
        throw new Error("WASM_MISSING");
    }
    try {
        await Pe();
    } catch (e) {
        console.warn("WASM 初始化跳過:", e);
    }
    const a = {
        images: [],
        direction: "grid",
        alignment: "center",
        scaleMode: "original",
        bgColor: "#000000",
        gridCols: 2,
        outputScale: 100,
        outputMode: "scale",
        baseWidth: 0,
        baseHeight: 0,
        format: "image/png"
    }, r = {
        dropZone: document.getElementById("main-drop-zone"),
        fileInput: document.getElementById("main-file-input"),
        imageList: document.getElementById("image-list"),
        fileCount: document.getElementById("file-count"),
        btnMerge: document.getElementById("btn-merge"),
        btnReset: document.getElementById("btn-reset"),
        dirBtns: [
            document.getElementById("dir-h"),
            document.getElementById("dir-v"),
            document.getElementById("dir-g")
        ],
        gridSettings: document.getElementById("grid-settings"),
        gridColsInput: document.getElementById("grid-cols"),
        outputModeSelect: document.getElementById("output-mode"),
        outputValueInput: document.getElementById("output-value"),
        alignmentSelect: document.getElementById("alignment"),
        scaleModeSelect: document.getElementById("scale-mode"),
        bgColorInput: document.getElementById("bg-color"),
        canvas: document.getElementById("merge-canvas"),
        canvasWrapper: document.getElementById("canvas-wrapper"),
        ctx: document.getElementById("merge-canvas").getContext("2d"),
        btnSave: document.getElementById("btn-save"),
        btnShare: document.getElementById("btn-share"),
        downloadSection: document.querySelector(".download-section"),
        previewInfo: document.getElementById("preview-info"),
        sortModal: document.getElementById("sort-modal"),
        sortList: document.getElementById("sort-list"),
        btnCloseModal: document.getElementById("close-modal"),
        btnApplySort: document.getElementById("btn-apply-sort")
    };
    function Re() {
        Ue();
    }
    function Ue() {
        r.dropZone.addEventListener("click", ()=>r.fileInput.click()), r.dropZone.addEventListener("dragover", (e)=>{
            e.preventDefault(), r.dropZone.classList.add("drag-over");
        }), r.dropZone.addEventListener("dragleave", ()=>r.dropZone.classList.remove("drag-over")), r.dropZone.addEventListener("drop", (e)=>{
            e.preventDefault(), r.dropZone.classList.remove("drag-over"), Q(e.dataTransfer.files);
        }), r.fileInput.addEventListener("change", (e)=>{
            Q(e.target.files);
        }), r.gridColsInput.addEventListener("change", (e)=>{
            const t = a.images.length || 1;
            a.gridCols = Math.min(t, Math.max(1, parseInt(e.target.value) || 1)), e.target.value = a.gridCols, I();
        }), r.outputModeSelect.addEventListener("change", (e)=>{
            a.outputMode = e.target.value, a.outputScale = 100, W(), I();
        }), r.outputValueInput.addEventListener("input", (e)=>{
            const t = parseFloat(e.target.value);
            if (!t) return;
            a.outputMode === "scale" ? a.outputScale = t : a.outputMode === "width" && a.baseWidth ? a.outputScale = t / a.baseWidth * 100 : a.outputMode === "height" && a.baseHeight && (a.outputScale = t / a.baseHeight * 100);
            const n = document.getElementById("output-value-label");
            n && (n.textContent = Math.round(t) + (a.outputMode === "scale" ? "%" : "px")), I();
        }), r.alignmentSelect.addEventListener("change", (e)=>{
            a.alignment = e.target.value, I();
        }), r.scaleModeSelect.addEventListener("change", (e)=>{
            a.scaleMode = e.target.value, I();
        }), r.bgColorInput.addEventListener("change", (e)=>{
            a.bgColor = e.target.value, I();
        }), r.btnMerge.addEventListener("click", async ()=>{
            a.images.length < 2 || (r.btnMerge.disabled = !0, r.btnMerge.textContent = "正在渲染畫布...", setTimeout(()=>{
                try {
                    Te();
                } catch (e) {
                    alert("渲染失敗: " + e.message);
                } finally{
                    r.btnMerge.disabled = !1, r.btnMerge.textContent = "生成合併圖";
                }
            }, 100));
        }), r.btnReset.addEventListener("click", Be), r.btnSave && r.btnSave.addEventListener("click", $e), r.btnShare && r.btnShare.addEventListener("click", Oe), r.canvasWrapper.addEventListener("click", ()=>{
            a.images.length > 0 && ke();
        }), r.btnCloseModal.addEventListener("click", j), r.sortModal.addEventListener("click", (e)=>{
            e.target === r.sortModal && j();
        }), r.btnApplySort.addEventListener("click", ()=>{
            j(), r.btnMerge.click();
        });
    }
    async function Q(e) {
        if (!e || e.length === 0) return;
        r.previewInfo.textContent = "正在處理並修正圖片方向...";
        const t = [];
        for (const n of Array.from(e))if (n.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(n.name)) try {
            const s = await new Promise((o, l)=>{
                const c = new Image, d = URL.createObjectURL(n);
                c.onload = ()=>{
                    const g = document.createElement("canvas");
                    g.width = c.width, g.height = c.height, g.getContext("2d").drawImage(c, 0, 0, g.width, g.height), g.toBlob((u)=>{
                        const h = URL.createObjectURL(u), b = new Image;
                        b.onload = ()=>{
                            URL.revokeObjectURL(d), o({
                                img: b,
                                name: n.name,
                                width: b.width,
                                height: b.height,
                                src: h
                            });
                        }, b.src = h;
                    }, "image/png");
                }, c.onerror = ()=>{
                    URL.revokeObjectURL(d), l(new Error(`圖片讀取失敗: ${n.name}`));
                }, c.src = d;
            });
            t.push(s);
        } catch (s) {
            console.error(s);
        }
        t.length > 0 && (a.images = [
            ...a.images,
            ...t
        ], T(), r.previewInfo.textContent = `已載入 ${a.images.length} 張圖片。`, r.downloadSection.style.display = "none");
    }
    function T() {
        r.fileCount.textContent = a.images.length, r.imageList.innerHTML = "", a.images.forEach((e, t)=>{
            const n = document.createElement("div");
            n.className = "image-item", n.draggable = !0, n.dataset.index = t, n.innerHTML = `
            <img src="${e.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `, n.querySelector(".btn-remove").addEventListener("click", (i)=>{
                i.stopPropagation(), URL.revokeObjectURL(a.images[t].src), a.images.splice(t, 1), T(), r.downloadSection.style.display = "none";
            }), n.addEventListener("dragstart", te), n.addEventListener("dragover", ne), n.addEventListener("drop", se), n.addEventListener("dragend", oe), n.addEventListener("dragenter", re), n.addEventListener("dragleave", ae), n.addEventListener("touchstart", ie, {
                passive: !1
            }), n.addEventListener("touchmove", ce, {
                passive: !1
            }), n.addEventListener("touchend", le, {
                passive: !1
            }), r.imageList.appendChild(n);
        }), r.btnMerge.disabled = a.images.length < 2;
    }
    function W() {
        if (!a.baseWidth || !a.baseHeight) return;
        const e = document.getElementById("output-value-label");
        let t = 100;
        a.outputMode === "scale" ? (r.outputValueInput.max = 100, t = Math.round(a.outputScale)) : a.outputMode === "width" ? (r.outputValueInput.max = a.baseWidth, t = Math.round(a.baseWidth * (a.outputScale / 100))) : a.outputMode === "height" && (r.outputValueInput.max = a.baseHeight, t = Math.round(a.baseHeight * (a.outputScale / 100))), r.outputValueInput.value = t, e && (e.textContent = t + (a.outputMode === "scale" ? "%" : "px"));
    }
    function ke() {
        V(), r.sortModal.classList.add("show"), document.body.style.overflow = "hidden";
    }
    function j() {
        r.sortModal.classList.remove("show"), document.body.style.overflow = "";
    }
    function V() {
        r.sortList.innerHTML = "", a.images.forEach((e, t)=>{
            const n = document.createElement("div");
            n.className = "sort-item", n.draggable = !0, n.dataset.index = t, n.innerHTML = `
            <img src="${e.src}" alt="Thumb" />
            <div class="info">${e.name}</div>
        `, n.addEventListener("dragstart", te), n.addEventListener("dragover", ne), n.addEventListener("drop", se), n.addEventListener("dragend", oe), n.addEventListener("dragenter", re), n.addEventListener("dragleave", ae), n.addEventListener("touchstart", ie, {
                passive: !1
            }), n.addEventListener("touchmove", ce, {
                passive: !1
            }), n.addEventListener("touchend", le, {
                passive: !1
            }), r.sortList.appendChild(n);
        });
    }
    let C = null;
    function te(e) {
        C = parseInt(this.dataset.index), this.classList.add("dragging"), e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", C);
    }
    function ne(e) {
        return e.preventDefault && e.preventDefault(), e.dataTransfer.dropEffect = "move", !1;
    }
    function re(e) {
        this.classList.add("drag-over");
    }
    function ae(e) {
        this.classList.remove("drag-over");
    }
    function se(e) {
        e.stopPropagation && e.stopPropagation();
        const t = parseInt(this.dataset.index);
        if (C !== t) {
            const n = a.images.splice(C, 1)[0];
            a.images.splice(t, 0, n), T(), V(), r.downloadSection.style.display === "block" && I();
        }
        return !1;
    }
    function oe(e) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("drag-over");
        });
    }
    let x = null;
    function ie(e) {
        e.touches.length === 1 && (C = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function ce(e) {
        if (e.touches.length !== 1 || C === null) return;
        e.preventDefault();
        const t = e.touches[0];
        this.style.pointerEvents = "none";
        const n = document.elementFromPoint(t.clientX, t.clientY);
        this.style.pointerEvents = "auto";
        const i = n?.closest(".image-item, .sort-item");
        x && x !== i && x.classList.remove("drag-over"), i && i.dataset.index !== void 0 && parseInt(i.dataset.index) !== C ? (i.classList.add("drag-over"), x = i) : x = null;
    }
    function le(e) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", x) {
            const t = parseInt(x.dataset.index);
            if (x.classList.remove("drag-over"), C !== null && !isNaN(t) && C !== t) {
                const n = a.images.splice(C, 1)[0];
                a.images.splice(t, 0, n), T(), V(), r.downloadSection.style.display === "block" && I();
            }
        }
        x = null, C = null, document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("dragging", "drag-over"), t.style.pointerEvents = "auto";
        });
    }
    function I() {
        if (a.images.length < 1) return;
        const e = a.images;
        let t = 0, n = 0;
        {
            const l = a.gridCols, c = Math.ceil(e.length / l);
            a.scaleMode === "fit-first" ? (t = e[0].width * l, n = e[0].height * c) : (t = Math.max(...e.map((d)=>d.width)) * l, n = Math.max(...e.map((d)=>d.height)) * c);
        }
        a.baseWidth = t, a.baseHeight = n;
        const i = a.outputScale / 100, s = t * i, o = n * i;
        r.canvas.width = s, r.canvas.height = o, r.canvas.style.width = s + "px", r.ctx.fillStyle = a.bgColor, r.ctx.fillRect(0, 0, s, o), r.ctx.save(), r.ctx.scale(i, i);
        {
            const l = a.gridCols, c = t / l, d = n / Math.ceil(e.length / l);
            e.forEach((g, v)=>{
                const u = Math.floor(v / l), h = v % l, b = c / g.width, m = d / g.height, p = (a.scaleMode === "fit-first", Math.min(b, m)), f = g.width * p, E = g.height * p;
                let R = h * c, A = u * d;
                a.alignment === "center" ? (R += (c - f) / 2, A += (d - E) / 2) : a.alignment === "end" && (R += c - f, A += d - E), r.ctx.drawImage(g.img, R, A, f, E);
            });
        }
        r.ctx.restore(), r.downloadSection.style.display = "block", r.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(s)} x ${Math.round(o)} (${a.outputScale.toFixed(1)}%)`, W();
    }
    async function Te() {
        if (!(a.images.length < 1)) {
            r.previewInfo.textContent = "Rust 引擎正在拼圖中...", r.btnMerge.disabled = !0;
            try {
                const e = await Promise.all(a.images.map((p)=>fetch(p.src).then((f)=>f.arrayBuffer()))), t = new Uint8Array(e.reduce((p, f)=>p + f.byteLength, 0)), n = new Uint32Array(a.images.length * 2);
                let i = 0;
                e.forEach((p, f)=>{
                    const E = new Uint8Array(p);
                    t.set(E, i), n[f * 2] = i, n[f * 2 + 1] = i + E.length, i += E.length;
                });
                const s = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                }, o = {
                    start: 0,
                    center: 1,
                    end: 2
                }, l = parseInt(a.bgColor.slice(1, 3), 16), c = parseInt(a.bgColor.slice(3, 5), 16), d = parseInt(a.bgColor.slice(5, 7), 16), g = performance.now();
                let v;
                try {
                    v = Ae(t, n, s[a.direction], o[a.alignment], a.gridCols, l, c, d);
                } catch (p) {
                    if (p.message === "WASM_MISSING" || p.toString().includes("WASM_MISSING")) {
                        console.info("使用 JS Fallback 引擎渲染..."), I();
                        const f = r.canvas.toDataURL("image/png"), E = await (await fetch(f)).blob(), R = URL.createObjectURL(E);
                        r.downloadSection.style.display = "block", r.previewInfo.textContent = `JS 引擎處理完成！解析度: ${r.canvas.width}x${r.canvas.height}`, r.btnMerge.disabled = !1, W();
                        return;
                    }
                    throw p;
                }
                const u = performance.now();
                console.log(`Rust 拼接耗時: ${(u - g).toFixed(2)}ms`);
                const h = new Blob([
                    v
                ], {
                    type: "image/png"
                }), b = URL.createObjectURL(h), m = new Image;
                m.onload = ()=>{
                    a.baseWidth = m.width, a.baseHeight = m.height, r.canvas.width = m.width, r.canvas.height = m.height, r.ctx.drawImage(m, 0, 0), r.downloadSection.style.display = "block", r.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${m.width}x${m.height} (耗時 ${(u - g).toFixed(0)}ms)`, r.btnMerge.disabled = !1, W();
                }, m.src = b;
            } catch (e) {
                console.error("Rust 處理失敗:", e), r.previewInfo.textContent = "Rust 引擎發生錯誤: " + e, r.btnMerge.disabled = !1;
            }
        }
    }
    async function $e() {
        try {
            r.btnSave.disabled = !0, r.btnSave.textContent = "正在儲存至外部儲存...";
            const e = r.canvas.toDataURL("image/png", .9);
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const t = e.split(",")[1], n = `PicMerger_${Date.now()}.png`;
                await ee.writeFile({
                    path: `PicMerger/${n}`,
                    data: t,
                    directory: B.Documents,
                    recursive: !0
                }), await Me.show({
                    text: `儲存成功！路徑：文件/PicMerger/${n}`,
                    duration: "long"
                }), r.btnSave.textContent = "✅ 已儲存至文件", alert(`儲存成功！
圖片已存於「文件/PicMerger/」資料夾中。
若相簿未立即出現，請手動前往查看或使用分享按鈕。`);
            } else {
                const t = document.createElement("a");
                t.href = e, t.download = `PicMerger_${Date.now()}.png`, t.click(), r.btnSave.textContent = "💾 儲存成功";
            }
        } catch (e) {
            console.error("儲存失敗:", e), alert("儲存失敗: " + e.message), r.btnSave.textContent = "❌ 儲存失敗";
        } finally{
            setTimeout(()=>{
                r.btnSave.disabled = !1, r.btnSave.textContent = "💾 直接儲存至文件資料夾";
            }, 3e3);
        }
    }
    async function Oe() {
        try {
            r.btnShare.disabled = !0, r.btnShare.textContent = "正在準備分享...";
            const e = r.canvas.toDataURL("image/png", .9), t = `PicMerger_Share_${Date.now()}.png`;
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const n = e.split(",")[1], i = await ee.writeFile({
                    path: t,
                    data: n,
                    directory: B.Cache
                });
                await xe.share({
                    title: "分享合併圖片",
                    url: i.uri,
                    dialogTitle: "分享圖片至..."
                }), r.btnShare.textContent = "✅ 分享完成";
            } else alert("此功能僅支援行動裝置版。"), r.btnShare.textContent = "🔗 分享圖片至其他 App";
        } catch (e) {
            e.message && e.message.toLowerCase().includes("user cancelled") ? r.btnShare.textContent = "🔗 分享圖片至其他 App" : (console.error("分享失敗:", e), alert("分享失敗: " + e.message), r.btnShare.textContent = "❌ 分享失敗");
        } finally{
            setTimeout(()=>{
                r.btnShare.disabled = !1, r.btnShare.textContent = "🔗 分享圖片至其他 App";
            }, 3e3);
        }
    }
    function Be() {
        a.images.forEach((e)=>URL.revokeObjectURL(e.src)), a.images = [], T(), r.ctx.clearRect(0, 0, r.canvas.width, r.canvas.height), r.previewInfo.textContent = "請上傳圖片以開始", r.downloadSection.style.display = "none", r.fileInput.value = "";
    }
    "serviceWorker" in navigator && window.addEventListener("load", ()=>{
        navigator.serviceWorker.register("sw.js");
    });
    Re();
})();
export { Y as E, q as W, ye as b, __tla };
