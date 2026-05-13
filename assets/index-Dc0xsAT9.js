(async ()=>{
    (function() {
        const a = document.createElement("link").relList;
        if (a && a.supports && a.supports("modulepreload")) return;
        for (const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);
        new MutationObserver((i)=>{
            for (const c of i)if (c.type === "childList") for (const l of c.addedNodes)l.tagName === "LINK" && l.rel === "modulepreload" && r(l);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function o(i) {
            const c = {};
            return i.integrity && (c.integrity = i.integrity), i.referrerPolicy && (c.referrerPolicy = i.referrerPolicy), i.crossOrigin === "use-credentials" ? c.credentials = "include" : i.crossOrigin === "anonymous" ? c.credentials = "omit" : c.credentials = "same-origin", c;
        }
        function r(i) {
            if (i.ep) return;
            i.ep = !0;
            const c = o(i);
            fetch(i.href, c);
        }
    })();
    const Z = "modulepreload", V = function(t, a) {
        return new URL(t, a).href;
    }, P = {}, z = function(a, o, r) {
        let i = Promise.resolve();
        if (o && o.length > 0) {
            let l = function(u) {
                return Promise.all(u.map((h)=>Promise.resolve(h).then((v)=>({
                            status: "fulfilled",
                            value: v
                        }), (v)=>({
                            status: "rejected",
                            reason: v
                        }))));
            };
            const s = document.getElementsByTagName("link"), f = document.querySelector("meta[property=csp-nonce]"), g = f?.nonce || f?.getAttribute("nonce");
            i = l(o.map((u)=>{
                if (u = V(u, r), u in P) return;
                P[u] = !0;
                const h = u.endsWith(".css"), v = h ? '[rel="stylesheet"]' : "";
                if (!!r) for(let m = s.length - 1; m >= 0; m--){
                    const p = s[m];
                    if (p.href === u && (!h || p.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${u}"]${v}`)) return;
                const d = document.createElement("link");
                if (d.rel = h ? "stylesheet" : Z, h || (d.as = "script"), d.crossOrigin = "", d.href = u, g && d.setAttribute("nonce", g), document.head.appendChild(d), h) return new Promise((m, p)=>{
                    d.addEventListener("load", m), d.addEventListener("error", ()=>p(new Error(`Unable to preload CSS for ${u}`)));
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
            return a().catch(c);
        });
    };
    console.log("DEBUG: main.js loading...");
    window.handleFiles = B;
    let k, U, G, q;
    async function J() {}
    let R = null;
    const n = {
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
    };
    let e = {};
    function T() {
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
            alignmentSelect: document.getElementById("alignment"),
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
        }, console.log("Elements initialized:", Object.keys(e).filter((t)=>e[t]));
    }
    async function K() {
        if (console.log("PicMerger v1.0.5 Initializing..."), J(), T(), e.btnShare) {
            const t = !!navigator.share;
            e.btnShare.disabled = !t, t || (e.btnShare.title = "當前瀏覽器不支援分享功能", e.btnShare.style.opacity = "0.4");
        }
        X(), console.log("Event listeners attached.");
        try {
            const { default: t, merge_images: a } = await z(async ()=>{
                const { default: o, merge_images: r } = await import("./pic_wasm-C60cSF7V.js");
                return {
                    default: o,
                    merge_images: r
                };
            }, [], import.meta.url);
            await t(), R = a, console.log("WASM engine loaded successfully.");
        } catch (t) {
            console.warn("WASM 載入跳過 (採用 JS 降級引擎):", t);
        }
    }
    function X() {
        document.addEventListener("click", (t)=>{
            t.target.closest("#main-drop-zone") && e.fileInput && (console.log("Global Click Delegate Triggered"), e.fileInput.click());
        }), e.dropZone && e.fileInput ? (e.dropZone.addEventListener("click", (t)=>{
            t.stopPropagation(), e.fileInput.click();
        }), e.dropZone.addEventListener("dragover", (t)=>{
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.add("drag-over");
        }), e.dropZone.addEventListener("dragleave", (t)=>{
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.remove("drag-over");
        }), e.dropZone.addEventListener("drop", (t)=>{
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.remove("drag-over"), console.log("Drop event triggered"), t.dataTransfer && t.dataTransfer.files && B(t.dataTransfer.files);
        }), e.fileInput.addEventListener("change", (t)=>{
            B(t.target.files);
        })) : console.error("Drop zone or file input not found!"), e.gridColsInput && e.gridColsInput.addEventListener("input", (t)=>{
            n.gridCols = parseInt(t.target.value) || 1;
            const a = document.getElementById("grid-cols-value");
            a && (a.textContent = n.gridCols), E();
        }), e.outputModeSelect && e.outputModeSelect.addEventListener("change", (t)=>{
            n.outputMode = t.target.value, n.outputScale = 100, M(), E();
        }), e.outputValueInput && e.outputValueInput.addEventListener("input", (t)=>{
            const a = parseFloat(t.target.value);
            if (!a) return;
            n.outputMode === "scale" ? n.outputScale = a : n.outputMode === "width" && n.baseWidth ? n.outputScale = a / n.baseWidth * 100 : n.outputMode === "height" && n.baseHeight && (n.outputScale = a / n.baseHeight * 100);
            const o = document.getElementById("output-value-label");
            o && (o.textContent = Math.round(a) + (n.outputMode === "scale" ? "%" : "px")), E();
        }), e.alignmentSelect && e.alignmentSelect.addEventListener("change", (t)=>{
            n.alignment = t.target.value, E();
        }), e.scaleModeSelect && e.scaleModeSelect.addEventListener("change", (t)=>{
            n.scaleMode = t.target.value, E();
        }), e.bgColorInput && e.bgColorInput.addEventListener("change", (t)=>{
            n.bgColor = t.target.value, E();
        }), e.btnMerge && e.btnMerge.addEventListener("click", async ()=>{
            n.images.length < 2 || (e.btnMerge.disabled = !0, e.btnMerge.textContent = "正在渲染畫布...", setTimeout(()=>{
                try {
                    ee();
                } catch (t) {
                    alert("渲染失敗: " + t.message);
                } finally{
                    e.btnMerge.disabled = !1, e.btnMerge.textContent = "生成合併圖";
                }
            }, 100));
        }), e.btnReset && e.btnReset.addEventListener("click", ae), e.btnSave && e.btnSave.addEventListener("click", te), e.btnShare && e.btnShare.addEventListener("click", ne), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
            n.images.length > 0 && Q();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", x), e.sortModal && e.sortModal.addEventListener("click", (t)=>{
            t.target === e.sortModal && x();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            x(), e.btnMerge && e.btnMerge.click();
        });
    }
    async function B(t) {
        if (console.log("Handling files:", t ? t.length : 0), !t || t.length === 0) return;
        (!e || !e.imageList) && (console.log("Lazy-initializing elements..."), T()), e.previewInfo && (e.previewInfo.textContent = "正在處理並修正圖片方向...");
        const a = [];
        for (const o of Array.from(t))if (o.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(o.name)) try {
            const i = await new Promise((c, l)=>{
                const s = new Image, f = URL.createObjectURL(o);
                s.onload = ()=>{
                    const g = document.createElement("canvas");
                    g.width = s.width, g.height = s.height, g.getContext("2d").drawImage(s, 0, 0, g.width, g.height), g.toBlob((h)=>{
                        const v = URL.createObjectURL(h), b = new Image;
                        b.onload = ()=>{
                            URL.revokeObjectURL(f), c({
                                img: b,
                                name: o.name,
                                width: b.width,
                                height: b.height,
                                src: v
                            });
                        }, b.src = v;
                    }, "image/png");
                }, s.onerror = ()=>{
                    URL.revokeObjectURL(f), l(new Error(`圖片讀取失敗: ${o.name}`));
                }, s.src = f;
            });
            a.push(i);
        } catch (i) {
            console.error(i);
        }
        a.length > 0 && (n.images = [
            ...n.images,
            ...a
        ], I(), e.previewInfo.textContent = `已載入 ${n.images.length} 張圖片。`, e.downloadSection.style.display = "none");
    }
    function I() {
        e.fileCount.textContent = n.images.length, e.imageList.innerHTML = "", n.images.forEach((t, a)=>{
            const o = document.createElement("div");
            o.className = "image-item", o.draggable = !0, o.dataset.index = a, o.innerHTML = `
            <img src="${t.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `, o.querySelector(".btn-remove").addEventListener("click", (r)=>{
                r.stopPropagation(), URL.revokeObjectURL(n.images[a].src), n.images.splice(a, 1), I(), e.downloadSection.style.display = "none";
            }), o.addEventListener("dragstart", W), o.addEventListener("dragover", $), o.addEventListener("drop", H), o.addEventListener("dragend", _), o.addEventListener("dragenter", A), o.addEventListener("dragleave", O), o.addEventListener("touchstart", N, {
                passive: !1
            }), o.addEventListener("touchmove", j, {
                passive: !1
            }), o.addEventListener("touchend", F, {
                passive: !1
            }), e.imageList.appendChild(o);
        }), e.btnMerge.disabled = n.images.length < 2, Y();
    }
    function Y() {
        if (e.gridColsInput) {
            const t = n.images.length || 1;
            console.log("Updating Grid Max to:", t), e.gridColsInput.max = t, n.gridCols > t && (n.gridCols = t, e.gridColsInput.value = t);
            const a = document.getElementById("grid-cols-value");
            a && (a.textContent = n.gridCols);
        } else console.warn("Grid input not found during update");
    }
    function M() {
        if (!n.baseWidth || !n.baseHeight) return;
        const t = document.getElementById("output-value-label");
        let a = 100;
        n.outputMode === "scale" ? (e.outputValueInput.max = 100, a = Math.round(n.outputScale)) : n.outputMode === "width" ? (e.outputValueInput.max = n.baseWidth, a = Math.round(n.baseWidth * (n.outputScale / 100))) : n.outputMode === "height" && (e.outputValueInput.max = n.baseHeight, a = Math.round(n.baseHeight * (n.outputScale / 100))), e.outputValueInput.value = a, t && (t.textContent = a + (n.outputMode === "scale" ? "%" : "px"));
    }
    function Q() {
        D(), e.sortModal.classList.add("show"), document.body.style.overflow = "hidden";
    }
    function x() {
        e.sortModal.classList.remove("show"), document.body.style.overflow = "";
    }
    function D() {
        e.sortList.innerHTML = "", n.images.forEach((t, a)=>{
            const o = document.createElement("div");
            o.className = "sort-item", o.draggable = !0, o.dataset.index = a, o.innerHTML = `
            <img src="${t.src}" alt="Thumb" />
            <div class="info">${t.name}</div>
        `, o.addEventListener("dragstart", W), o.addEventListener("dragover", $), o.addEventListener("drop", H), o.addEventListener("dragend", _), o.addEventListener("dragenter", A), o.addEventListener("dragleave", O), o.addEventListener("touchstart", N, {
                passive: !1
            }), o.addEventListener("touchmove", j, {
                passive: !1
            }), o.addEventListener("touchend", F, {
                passive: !1
            }), e.sortList.appendChild(o);
        });
    }
    let y = null;
    function W(t) {
        y = parseInt(this.dataset.index), this.classList.add("dragging"), t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", y);
    }
    function $(t) {
        return t.preventDefault && t.preventDefault(), t.dataTransfer.dropEffect = "move", !1;
    }
    function A(t) {
        this.classList.add("drag-over");
    }
    function O(t) {
        this.classList.remove("drag-over");
    }
    function H(t) {
        t.stopPropagation && t.stopPropagation();
        const a = parseInt(this.dataset.index);
        if (y !== a) {
            const o = n.images.splice(y, 1)[0];
            n.images.splice(a, 0, o), I(), D(), e.downloadSection.style.display === "block" && E();
        }
        return !1;
    }
    function _(t) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((a)=>{
            a.classList.remove("drag-over");
        });
    }
    let L = null;
    function N(t) {
        t.touches.length === 1 && (y = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function j(t) {
        if (t.touches.length !== 1 || y === null) return;
        t.preventDefault();
        const a = t.touches[0];
        this.style.pointerEvents = "none";
        const o = document.elementFromPoint(a.clientX, a.clientY);
        this.style.pointerEvents = "auto";
        const r = o?.closest(".image-item, .sort-item");
        L && L !== r && L.classList.remove("drag-over"), r && r.dataset.index !== void 0 && parseInt(r.dataset.index) !== y ? (r.classList.add("drag-over"), L = r) : L = null;
    }
    function F(t) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", L) {
            const a = parseInt(L.dataset.index);
            if (L.classList.remove("drag-over"), y !== null && !isNaN(a) && y !== a) {
                const o = n.images.splice(y, 1)[0];
                n.images.splice(a, 0, o), I(), D(), e.downloadSection.style.display === "block" && E();
            }
        }
        L = null, y = null, document.querySelectorAll(".image-item, .sort-item").forEach((a)=>{
            a.classList.remove("dragging", "drag-over"), a.style.pointerEvents = "auto";
        });
    }
    function E() {
        if (n.images.length < 1) return;
        const t = n.images;
        let a = 0, o = 0;
        {
            const l = n.gridCols, s = Math.ceil(t.length / l);
            n.scaleMode === "fit-first" ? (a = t[0].width * l, o = t[0].height * s) : (a = Math.max(...t.map((f)=>f.width)) * l, o = Math.max(...t.map((f)=>f.height)) * s);
        }
        n.baseWidth = a, n.baseHeight = o;
        const r = n.outputScale / 100, i = a * r, c = o * r;
        e.canvas.width = i, e.canvas.height = c, e.canvas.style.width = i + "px", e.ctx.fillStyle = n.bgColor, e.ctx.fillRect(0, 0, i, c), e.ctx.save(), e.ctx.scale(r, r);
        {
            const l = n.gridCols, s = a / l, f = o / Math.ceil(t.length / l);
            t.forEach((g, u)=>{
                const h = Math.floor(u / l), v = u % l, b = s / g.width, d = f / g.height, m = (n.scaleMode === "fit-first", Math.min(b, d)), p = g.width * m, w = g.height * m;
                let S = v * s, C = h * f;
                n.alignment === "center" ? (S += (s - p) / 2, C += (f - w) / 2) : n.alignment === "end" && (S += s - p, C += f - w), e.ctx.drawImage(g.img, S, C, p, w);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(i)} x ${Math.round(c)} (${n.outputScale.toFixed(1)}%)`, M();
    }
    async function ee() {
        if (!(n.images.length < 1)) {
            e.previewInfo.textContent = "Rust 引擎正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const t = await Promise.all(n.images.map((m)=>fetch(m.src).then((p)=>p.arrayBuffer()))), a = new Uint8Array(t.reduce((m, p)=>m + p.byteLength, 0)), o = new Uint32Array(n.images.length * 2);
                let r = 0;
                t.forEach((m, p)=>{
                    const w = new Uint8Array(m);
                    a.set(w, r), o[p * 2] = r, o[p * 2 + 1] = r + w.length, r += w.length;
                });
                const i = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                }, c = {
                    start: 0,
                    center: 1,
                    end: 2
                }, l = parseInt(n.bgColor.slice(1, 3), 16), s = parseInt(n.bgColor.slice(3, 5), 16), f = parseInt(n.bgColor.slice(5, 7), 16), g = performance.now();
                let u;
                try {
                    if (!R) throw new Error("WASM_MISSING");
                    u = R(a, o, i[n.direction], c[n.alignment], n.gridCols, l, s, f);
                } catch (m) {
                    if (m.message === "WASM_MISSING" || m.toString().includes("WASM_MISSING")) {
                        console.info("使用 JS Fallback 引擎渲染..."), E();
                        const p = e.canvas.toDataURL("image/png"), w = await (await fetch(p)).blob(), S = URL.createObjectURL(w);
                        e.downloadSection.style.display = "block", e.previewInfo.textContent = `JS 引擎處理完成！解析度: ${e.canvas.width}x${e.canvas.height}`, e.btnMerge.disabled = !1, M();
                        return;
                    }
                    throw m;
                }
                const h = performance.now();
                console.log(`Rust 拼接耗時: ${(h - g).toFixed(2)}ms`);
                const v = new Blob([
                    u
                ], {
                    type: "image/png"
                }), b = URL.createObjectURL(v), d = new Image;
                d.onload = ()=>{
                    n.baseWidth = d.width, n.baseHeight = d.height, e.canvas.width = d.width, e.canvas.height = d.height, e.ctx.drawImage(d, 0, 0), e.downloadSection.style.display = "block", e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${d.width}x${d.height} (耗時 ${(h - g).toFixed(0)}ms)`, e.btnMerge.disabled = !1, M();
                }, d.src = b;
            } catch (t) {
                console.error("Rust 處理失敗:", t), e.previewInfo.textContent = "Rust 引擎發生錯誤: " + t, e.btnMerge.disabled = !1;
            }
        }
    }
    async function te() {
        try {
            e.btnSave.disabled = !0, e.btnSave.textContent = "正在儲存至外部儲存...";
            const t = e.canvas.toDataURL("image/png", .9);
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const a = t.split(",")[1], o = `PicMerger_${Date.now()}.png`;
                await k.writeFile({
                    path: `PicMerger/${o}`,
                    data: a,
                    directory: U.Documents,
                    recursive: !0
                }), await q.show({
                    text: `儲存成功！路徑：文件/PicMerger/${o}`,
                    duration: "long"
                }), e.btnSave.textContent = "✅ 已儲存至文件", alert(`儲存成功！
圖片已存於「文件/PicMerger/」資料夾中。
若相簿未立即出現，請手動前往查看或使用分享按鈕。`);
            } else {
                const a = document.createElement("a");
                a.href = t, a.download = `PicMerger_${Date.now()}.png`, a.click(), e.btnSave.textContent = "💾 儲存成功";
            }
        } catch (t) {
            console.error("儲存失敗:", t), alert("儲存失敗: " + t.message), e.btnSave.textContent = "❌ 儲存失敗";
        } finally{
            setTimeout(()=>{
                e.btnSave.disabled = !1, e.btnSave.textContent = "💾 直接儲存至文件資料夾";
            }, 3e3);
        }
    }
    async function ne() {
        try {
            e.btnShare.disabled = !0, e.btnShare.textContent = "正在準備分享...";
            const t = e.canvas.toDataURL("image/png", .9), a = `PicMerger_Share_${Date.now()}.png`;
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const o = t.split(",")[1], r = await k.writeFile({
                    path: a,
                    data: o,
                    directory: U.Cache
                });
                await G.share({
                    title: "分享合併圖片",
                    url: r.uri,
                    dialogTitle: "分享圖片至..."
                }), e.btnShare.textContent = "✅ 分享完成";
            } else alert("此功能僅支援行動裝置版。"), e.btnShare.textContent = "🔗 分享圖片至其他 App";
        } catch (t) {
            t.message && t.message.toLowerCase().includes("user cancelled") ? e.btnShare.textContent = "🔗 分享圖片至其他 App" : (console.error("分享失敗:", t), alert("分享失敗: " + t.message), e.btnShare.textContent = "❌ 分享失敗");
        } finally{
            setTimeout(()=>{
                e.btnShare.disabled = !1, e.btnShare.textContent = "🔗 分享圖片至其他 App";
            }, 3e3);
        }
    }
    function ae() {
        n.images.forEach((t)=>URL.revokeObjectURL(t.src)), n.images = [], I(), e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height), e.previewInfo.textContent = "請上傳圖片以開始", e.downloadSection.style.display = "none", e.fileInput.value = "";
    }
    window.addEventListener("dragover", (t)=>t.preventDefault(), !1);
    window.addEventListener("drop", (t)=>t.preventDefault(), !1);
    "serviceWorker" in navigator && window.addEventListener("load", ()=>{
        try {
            navigator.serviceWorker.register("sw.js").catch((t)=>console.warn("SW register failed (ignored)"));
        } catch  {}
    });
    K();
})();
