(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);
        new MutationObserver((i)=>{
            for (const c of i)if (c.type === "childList") for (const l of c.addedNodes)l.tagName === "LINK" && l.rel === "modulepreload" && r(l);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function a(i) {
            const c = {};
            return i.integrity && (c.integrity = i.integrity), i.referrerPolicy && (c.referrerPolicy = i.referrerPolicy), i.crossOrigin === "use-credentials" ? c.credentials = "include" : i.crossOrigin === "anonymous" ? c.credentials = "omit" : c.credentials = "same-origin", c;
        }
        function r(i) {
            if (i.ep) return;
            i.ep = !0;
            const c = a(i);
            fetch(i.href, c);
        }
    })();
    const j = "modulepreload", F = function(n, t) {
        return new URL(n, t).href;
    }, R = {}, Z = function(t, a, r) {
        let i = Promise.resolve();
        if (a && a.length > 0) {
            let l = function(u) {
                return Promise.all(u.map((h)=>Promise.resolve(h).then((v)=>({
                            status: "fulfilled",
                            value: v
                        }), (v)=>({
                            status: "rejected",
                            reason: v
                        }))));
            };
            const s = document.getElementsByTagName("link"), m = document.querySelector("meta[property=csp-nonce]"), f = m?.nonce || m?.getAttribute("nonce");
            i = l(a.map((u)=>{
                if (u = F(u, r), u in R) return;
                R[u] = !0;
                const h = u.endsWith(".css"), v = h ? '[rel="stylesheet"]' : "";
                if (!!r) for(let g = s.length - 1; g >= 0; g--){
                    const p = s[g];
                    if (p.href === u && (!h || p.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${u}"]${v}`)) return;
                const d = document.createElement("link");
                if (d.rel = h ? "stylesheet" : j, h || (d.as = "script"), d.crossOrigin = "", d.href = u, f && d.setAttribute("nonce", f), document.head.appendChild(d), h) return new Promise((g, p)=>{
                    d.addEventListener("load", g), d.addEventListener("error", ()=>p(new Error(`Unable to preload CSS for ${u}`)));
                });
            }));
        }
        function c(l) {
            const s = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (s.payload = l, window.dispatchEvent(s), !s.defaultPrevented) throw l;
        }
        return i.then((l)=>{
            for (const s of l || [])s.status === "rejected" && c(s.reason);
            return t().catch(c);
        });
    };
    console.log("DEBUG: main.js loading...");
    window.handleFiles = x;
    let B, D, V, q;
    async function G() {}
    let C = null;
    const o = {
        images: [],
        direction: "grid",
        scaleMode: "original",
        bgColor: "#000000",
        gridCols: 1,
        outputScale: 100,
        outputMode: "scale",
        baseWidth: 0,
        baseHeight: 0,
        format: "image/png",
        canShare: !!navigator.share
    };
    let e = {};
    function k() {
        e = {
            dropZone: document.getElementById("main-drop-zone"),
            fileInput: document.getElementById("main-file-input"),
            imageList: document.getElementById("image-list"),
            fileCount: document.getElementById("file-count"),
            btnMerge: document.getElementById("btn-merge"),
            btnReset: document.getElementById("btn-reset"),
            gridSettings: document.getElementById("grid-settings"),
            gridColsInput: document.getElementById("grid-cols"),
            outputModeSelect: document.getElementById("output-mode"),
            outputValueInput: document.getElementById("output-value"),
            scaleModeSelect: document.getElementById("scale-mode"),
            bgColorInput: document.getElementById("bg-color"),
            canvas: document.getElementById("merge-canvas"),
            canvasWrapper: document.getElementById("canvas-wrapper"),
            ctx: document.getElementById("merge-canvas")?.getContext("2d"),
            btnSave: document.getElementById("btn-save"),
            btnShare: document.getElementById("btn-share"),
            downloadSection: document.querySelector(".download-section"),
            previewInfo: document.getElementById("preview-info"),
            sortModal: document.getElementById("sort-modal"),
            sortList: document.getElementById("sort-list"),
            btnCloseModal: document.getElementById("close-modal"),
            btnApplySort: document.getElementById("btn-apply-sort")
        }, console.log("Elements initialized:", Object.keys(e).filter((n)=>e[n]));
    }
    async function z() {
        console.log("PicMerger v1.0.8 Initializing..."), G(), k(), e.btnShare && (window.Capacitor && window.Capacitor.isNativePlatform() && o.canShare ? (e.btnShare.style.setProperty("display", "block", "important"), e.btnShare.disabled = !1) : e.btnShare.style.setProperty("display", "none", "important")), J(), console.log("Event listeners attached.");
        try {
            const { default: n, merge_images: t } = await Z(async ()=>{
                const { default: a, merge_images: r } = await import("./pic_wasm-C60cSF7V.js");
                return {
                    default: a,
                    merge_images: r
                };
            }, [], import.meta.url);
            await n(), C = t, console.log("WASM engine loaded successfully.");
        } catch (n) {
            console.warn("WASM 載入跳過 (採用 JS 降級引擎):", n);
        }
    }
    function J() {
        document.addEventListener("click", (t)=>{
            if (e.fileInput && t.target === e.fileInput) return;
            t.target.closest("#main-drop-zone") && e.fileInput && (console.log("Global Click Delegate Triggered"), e.fileInput.click());
        }), e.dropZone && e.fileInput ? (e.dropZone.addEventListener("click", (t)=>{
            t.target !== e.fileInput && (t.stopPropagation(), e.fileInput.click());
        }), e.dropZone.addEventListener("dragover", (t)=>{
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.add("drag-over");
        }), e.dropZone.addEventListener("dragleave", (t)=>{
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.remove("drag-over");
        }), e.dropZone.addEventListener("drop", (t)=>{
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.remove("drag-over"), console.log("Drop event triggered"), t.dataTransfer && t.dataTransfer.files && x(t.dataTransfer.files);
        }), e.fileInput.addEventListener("change", (t)=>{
            x(t.target.files);
        })) : console.error("Drop zone or file input not found!"), e.gridColsInput && e.gridColsInput.addEventListener("input", (t)=>{
            o.gridCols = parseInt(t.target.value) || 1;
            const a = document.getElementById("grid-cols-value");
            a && (a.textContent = o.gridCols), E();
        });
        const n = document.getElementById("output-mode-group");
        n && n.querySelectorAll("button").forEach((t)=>{
            t.addEventListener("click", ()=>{
                o.outputMode = t.dataset.value, o.outputScale = 100, n.querySelectorAll("button").forEach((a)=>a.classList.remove("active")), t.classList.add("active"), I(), E();
            });
        }), e.outputValueInput && e.outputValueInput.addEventListener("input", (t)=>{
            const a = parseFloat(t.target.value);
            if (!a) return;
            o.outputMode === "scale" ? o.outputScale = a : o.outputMode === "width" && o.baseWidth ? o.outputScale = a / o.baseWidth * 100 : o.outputMode === "height" && o.baseHeight && (o.outputScale = a / o.baseHeight * 100);
            const r = document.getElementById("output-value-label");
            r && (r.textContent = Math.round(a) + (o.outputMode === "scale" ? "%" : "px")), E();
        }), e.scaleModeSelect && e.scaleModeSelect.addEventListener("change", (t)=>{
            o.scaleMode = t.target.value, E();
        }), e.bgColorInput && e.bgColorInput.addEventListener("change", (t)=>{
            o.bgColor = t.target.value, E();
        }), e.btnMerge && e.btnMerge.addEventListener("click", async ()=>{
            o.images.length < 2 || (e.btnMerge.disabled = !0, e.btnMerge.textContent = "正在渲染畫布...", setTimeout(()=>{
                try {
                    Y();
                } catch (t) {
                    alert("渲染失敗: " + t.message);
                } finally{
                    e.btnMerge.disabled = !1, e.btnMerge.textContent = "生成合併圖";
                }
            }, 100));
        }), e.btnReset && e.btnReset.addEventListener("click", te), e.btnSave && e.btnSave.addEventListener("click", Q), e.btnShare && e.btnShare.addEventListener("click", ee), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
            o.images.length > 0 && X();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", M), e.sortModal && e.sortModal.addEventListener("click", (t)=>{
            t.target === e.sortModal && M();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            M(), e.btnMerge && e.btnMerge.click();
        });
    }
    async function x(n) {
        if (console.log("Handling files:", n ? n.length : 0), !n || n.length === 0) return;
        (!e || !e.imageList) && (console.log("Lazy-initializing elements..."), k()), e.previewInfo && (e.previewInfo.textContent = "正在處理並修正圖片方向...");
        const t = [];
        for (const a of Array.from(n))if (a.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(a.name)) try {
            const i = await new Promise((c, l)=>{
                const s = new Image, m = URL.createObjectURL(a);
                s.onload = ()=>{
                    const f = document.createElement("canvas");
                    f.width = s.width, f.height = s.height, f.getContext("2d").drawImage(s, 0, 0, f.width, f.height), f.toBlob((h)=>{
                        const v = URL.createObjectURL(h), y = new Image;
                        y.onload = ()=>{
                            URL.revokeObjectURL(m), c({
                                img: y,
                                name: a.name,
                                width: y.width,
                                height: y.height,
                                src: v
                            });
                        }, y.src = v;
                    }, "image/png");
                }, s.onerror = ()=>{
                    URL.revokeObjectURL(m), l(new Error(`圖片讀取失敗: ${a.name}`));
                }, s.src = m;
            });
            t.push(i);
        } catch (i) {
            console.error(i);
        }
        t.length > 0 && (o.images = [
            ...o.images,
            ...t
        ], S(), e.previewInfo.textContent = `已載入 ${o.images.length} 張圖片。`, e.downloadSection.style.display = "none", setTimeout(()=>{
            console.log("Auto-triggering preview..."), E();
        }, 100));
    }
    function S() {
        e.fileCount.textContent = o.images.length, e.imageList.innerHTML = "", o.images.forEach((n, t)=>{
            const a = document.createElement("div");
            a.className = "image-item", a.draggable = !0, a.dataset.index = t, a.innerHTML = `
            <img src="${n.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `, a.querySelector(".btn-remove").addEventListener("click", (r)=>{
                r.stopPropagation(), URL.revokeObjectURL(o.images[t].src), o.images.splice(t, 1), S(), e.downloadSection.style.display = "none";
            }), a.addEventListener("dragstart", U), a.addEventListener("dragover", T), a.addEventListener("drop", N), a.addEventListener("dragend", $), a.addEventListener("dragenter", W), a.addEventListener("dragleave", A), a.addEventListener("touchstart", O, {
                passive: !1
            }), a.addEventListener("touchmove", _, {
                passive: !1
            }), a.addEventListener("touchend", H, {
                passive: !1
            }), e.imageList.appendChild(a);
        }), e.btnMerge.disabled = o.images.length < 2, K();
    }
    function K() {
        if (e.gridColsInput) {
            const n = o.images.length || 1;
            console.log("Updating Grid Max to:", n), e.gridColsInput.max = n, o.gridCols > n && (o.gridCols = n), e.gridColsInput.value = o.gridCols;
            const t = document.getElementById("grid-cols-value");
            t && (t.textContent = o.gridCols);
        } else console.warn("Grid input not found during update");
    }
    function I() {
        if (!o.baseWidth || !o.baseHeight) return;
        const n = document.getElementById("output-value-label");
        let t = 100;
        o.outputMode === "scale" ? (e.outputValueInput.max = 100, t = Math.round(o.outputScale)) : o.outputMode === "width" ? (e.outputValueInput.max = o.baseWidth, t = Math.round(o.baseWidth * (o.outputScale / 100))) : o.outputMode === "height" && (e.outputValueInput.max = o.baseHeight, t = Math.round(o.baseHeight * (o.outputScale / 100))), e.outputValueInput.value = t, n && (n.textContent = t + (o.outputMode === "scale" ? "%" : "px"));
    }
    function X() {
        P(), e.sortModal.classList.add("show"), document.body.style.overflow = "hidden";
    }
    function M() {
        e.sortModal.classList.remove("show"), document.body.style.overflow = "";
    }
    function P() {
        e.sortList.innerHTML = "", o.images.forEach((n, t)=>{
            const a = document.createElement("div");
            a.className = "sort-item", a.draggable = !0, a.dataset.index = t, a.innerHTML = `
            <img src="${n.src}" alt="Thumb" />
            <div class="info">${n.name}</div>
        `, a.addEventListener("dragstart", U), a.addEventListener("dragover", T), a.addEventListener("drop", N), a.addEventListener("dragend", $), a.addEventListener("dragenter", W), a.addEventListener("dragleave", A), a.addEventListener("touchstart", O, {
                passive: !1
            }), a.addEventListener("touchmove", _, {
                passive: !1
            }), a.addEventListener("touchend", H, {
                passive: !1
            }), e.sortList.appendChild(a);
        });
    }
    let b = null;
    function U(n) {
        b = parseInt(this.dataset.index), this.classList.add("dragging"), n.dataTransfer.effectAllowed = "move", n.dataTransfer.setData("text/plain", b);
    }
    function T(n) {
        return n.preventDefault && n.preventDefault(), n.dataTransfer.dropEffect = "move", !1;
    }
    function W(n) {
        this.classList.add("drag-over");
    }
    function A(n) {
        this.classList.remove("drag-over");
    }
    function N(n) {
        n.stopPropagation && n.stopPropagation();
        const t = parseInt(this.dataset.index);
        if (b !== t) {
            const a = o.images.splice(b, 1)[0];
            o.images.splice(t, 0, a), S(), P(), e.downloadSection.style.display === "block" && E();
        }
        return !1;
    }
    function $(n) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("drag-over");
        });
    }
    let w = null;
    function O(n) {
        n.touches.length === 1 && (b = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function _(n) {
        if (n.touches.length !== 1 || b === null) return;
        n.preventDefault();
        const t = n.touches[0];
        this.style.pointerEvents = "none";
        const a = document.elementFromPoint(t.clientX, t.clientY);
        this.style.pointerEvents = "auto";
        const r = a?.closest(".image-item, .sort-item");
        w && w !== r && w.classList.remove("drag-over"), r && r.dataset.index !== void 0 && parseInt(r.dataset.index) !== b ? (r.classList.add("drag-over"), w = r) : w = null;
    }
    function H(n) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", w) {
            const t = parseInt(w.dataset.index);
            if (w.classList.remove("drag-over"), b !== null && !isNaN(t) && b !== t) {
                const a = o.images.splice(b, 1)[0];
                o.images.splice(t, 0, a), S(), P(), e.downloadSection.style.display === "block" && E();
            }
        }
        w = null, b = null, document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("dragging", "drag-over"), t.style.pointerEvents = "auto";
        });
    }
    function E() {
        if (o.images.length < 1) return;
        const n = o.images;
        let t = 0, a = 0;
        {
            const l = o.gridCols, s = Math.ceil(n.length / l);
            o.scaleMode === "fit-first" ? (t = n[0].width * l, a = n[0].height * s) : (t = Math.max(...n.map((m)=>m.width)) * l, a = Math.max(...n.map((m)=>m.height)) * s);
        }
        o.baseWidth = t, o.baseHeight = a;
        const r = o.outputScale / 100, i = t * r, c = a * r;
        e.canvas.width = i, e.canvas.height = c, e.canvas.style.width = i + "px", e.ctx.fillStyle = o.bgColor, e.ctx.fillRect(0, 0, i, c), e.ctx.save(), e.ctx.scale(r, r);
        {
            const l = o.gridCols, s = t / l, m = a / Math.ceil(n.length / l);
            n.forEach((f, u)=>{
                const h = Math.floor(u / l), v = u % l, y = s, d = m;
                let g = v * s, p = h * m;
                e.ctx.drawImage(f.img, g, p, y, d);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(i)} x ${Math.round(c)} (${o.outputScale.toFixed(1)}%)`, I();
    }
    async function Y() {
        if (!(o.images.length < 1)) {
            e.previewInfo.textContent = "Rust 引擎正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const n = await Promise.all(o.images.map((g)=>fetch(g.src).then((p)=>p.arrayBuffer()))), t = new Uint8Array(n.reduce((g, p)=>g + p.byteLength, 0)), a = new Uint32Array(o.images.length * 2);
                let r = 0;
                n.forEach((g, p)=>{
                    const L = new Uint8Array(g);
                    t.set(L, r), a[p * 2] = r, a[p * 2 + 1] = r + L.length, r += L.length;
                });
                const i = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                }, c = {
                    start: 0,
                    center: 1,
                    end: 2
                }, l = parseInt(o.bgColor.slice(1, 3), 16), s = parseInt(o.bgColor.slice(3, 5), 16), m = parseInt(o.bgColor.slice(5, 7), 16), f = performance.now();
                let u;
                try {
                    if (!C) throw new Error("WASM_MISSING");
                    u = C(t, a, i[o.direction], 1, o.gridCols, l, s, m);
                } catch (g) {
                    if (g.message === "WASM_MISSING" || g.toString().includes("WASM_MISSING")) {
                        console.info("使用 JS Fallback 引擎渲染..."), E();
                        const p = e.canvas.toDataURL("image/png"), L = await (await fetch(p)).blob(), ne = URL.createObjectURL(L);
                        e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `JS 引擎處理完成！解析度: ${e.canvas.width}x${e.canvas.height}`, e.btnMerge.disabled = !1, I();
                        return;
                    }
                    throw g;
                }
                const h = performance.now();
                console.log(`Rust 拼接耗時: ${(h - f).toFixed(2)}ms`);
                const v = new Blob([
                    u
                ], {
                    type: "image/png"
                }), y = URL.createObjectURL(v), d = new Image;
                d.onload = ()=>{
                    o.baseWidth = d.width, o.baseHeight = d.height, e.canvas.width = d.width, e.canvas.height = d.height, e.ctx.drawImage(d, 0, 0), e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${d.width}x${d.height} (耗時 ${(h - f).toFixed(0)}ms)`, e.btnMerge.disabled = !1, I();
                }, d.src = y;
            } catch (n) {
                console.error("Rust 處理失敗:", n), e.previewInfo.textContent = "Rust 引擎發生錯誤: " + n, e.btnMerge.disabled = !1;
            }
        }
    }
    async function Q() {
        try {
            e.btnSave.disabled = !0, e.btnSave.textContent = "正在儲存至外部儲存...";
            const n = e.canvas.toDataURL("image/png", .9);
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const t = n.split(",")[1], a = `PicMerger_${Date.now()}.png`;
                await B.writeFile({
                    path: `PicMerger/${a}`,
                    data: t,
                    directory: D.Documents,
                    recursive: !0
                }), await q.show({
                    text: `儲存成功！路徑：文件/PicMerger/${a}`,
                    duration: "long"
                }), e.btnSave.textContent = "✅ 已儲存至文件", alert(`儲存成功！
圖片已存於「文件/PicMerger/」資料夾中。
若相簿未立即出現，請手動前往查看或使用分享按鈕。`);
            } else {
                const t = document.createElement("a");
                t.href = n, t.download = `PicMerger_${Date.now()}.png`, t.click(), e.btnSave.textContent = "💾 儲存成功";
            }
        } catch (n) {
            console.error("儲存失敗:", n), alert("儲存失敗: " + n.message), e.btnSave.textContent = "❌ 儲存失敗";
        } finally{
            setTimeout(()=>{
                e.btnSave.disabled = !1, e.btnSave.textContent = "💾 直接儲存至文件資料夾", e.btnShare && (e.btnShare.disabled = !o.canShare);
            }, 3e3);
        }
    }
    async function ee() {
        try {
            e.btnShare.disabled = !0, e.btnShare.textContent = "正在準備分享...";
            const n = e.canvas.toDataURL("image/png", .9), t = `PicMerger_Share_${Date.now()}.png`;
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const a = n.split(",")[1], r = await B.writeFile({
                    path: t,
                    data: a,
                    directory: D.Cache
                });
                await V.share({
                    title: "分享合併圖片",
                    url: r.uri,
                    dialogTitle: "分享圖片至..."
                }), e.btnShare.textContent = "✅ 分享完成";
            } else alert("此功能僅支援行動裝置版。"), e.btnShare.textContent = "🔗 分享圖片至其他 App";
        } catch (n) {
            n.message && n.message.toLowerCase().includes("user cancelled") ? e.btnShare.textContent = "🔗 分享圖片至其他 App" : (console.error("分享失敗:", n), alert("分享失敗: " + n.message), e.btnShare.textContent = "❌ 分享失敗");
        } finally{
            setTimeout(()=>{
                e.btnShare && (!(window.Capacitor && window.Capacitor.isNativePlatform()) || !o.canShare ? e.btnShare.style.setProperty("display", "none", "important") : (e.btnShare.disabled = !1, e.btnShare.textContent = "🔗 分享圖片至其他 App"));
            }, 3e3);
        }
    }
    function te() {
        o.images.forEach((n)=>URL.revokeObjectURL(n.src)), o.images = [], S(), e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height), e.previewInfo.textContent = "請上傳圖片以開始", e.downloadSection.style.display = "none", e.fileInput.value = "";
    }
    window.addEventListener("dragover", (n)=>n.preventDefault(), !1);
    window.addEventListener("drop", (n)=>n.preventDefault(), !1);
    "serviceWorker" in navigator && window.addEventListener("load", ()=>{
        try {
            navigator.serviceWorker.register("sw.js").catch((n)=>console.warn("SW register failed (ignored)"));
        } catch  {}
    });
    z();
})();
