(async ()=>{
    (function() {
        const o = document.createElement("link").relList;
        if (o && o.supports && o.supports("modulepreload")) return;
        for (const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);
        new MutationObserver((s)=>{
            for (const c of s)if (c.type === "childList") for (const l of c.addedNodes)l.tagName === "LINK" && l.rel === "modulepreload" && r(l);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function a(s) {
            const c = {};
            return s.integrity && (c.integrity = s.integrity), s.referrerPolicy && (c.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? c.credentials = "include" : s.crossOrigin === "anonymous" ? c.credentials = "omit" : c.credentials = "same-origin", c;
        }
        function r(s) {
            if (s.ep) return;
            s.ep = !0;
            const c = a(s);
            fetch(s.href, c);
        }
    })();
    const F = "modulepreload", Z = function(t, o) {
        return new URL(t, o).href;
    }, D = {}, V = function(o, a, r) {
        let s = Promise.resolve();
        if (a && a.length > 0) {
            let l = function(g) {
                return Promise.all(g.map((h)=>Promise.resolve(h).then((v)=>({
                            status: "fulfilled",
                            value: v
                        }), (v)=>({
                            status: "rejected",
                            reason: v
                        }))));
            };
            const i = document.getElementsByTagName("link"), f = document.querySelector("meta[property=csp-nonce]"), u = f?.nonce || f?.getAttribute("nonce");
            s = l(a.map((g)=>{
                if (g = Z(g, r), g in D) return;
                D[g] = !0;
                const h = g.endsWith(".css"), v = h ? '[rel="stylesheet"]' : "";
                if (!!r) for(let m = i.length - 1; m >= 0; m--){
                    const p = i[m];
                    if (p.href === g && (!h || p.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${g}"]${v}`)) return;
                const d = document.createElement("link");
                if (d.rel = h ? "stylesheet" : F, h || (d.as = "script"), d.crossOrigin = "", d.href = g, u && d.setAttribute("nonce", u), document.head.appendChild(d), h) return new Promise((m, p)=>{
                    d.addEventListener("load", m), d.addEventListener("error", ()=>p(new Error(`Unable to preload CSS for ${g}`)));
                });
            }));
        }
        function c(l) {
            const i = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (i.payload = l, window.dispatchEvent(i), !i.defaultPrevented) throw l;
        }
        return s.then((l)=>{
            for (const i of l || [])i.status === "rejected" && c(i.reason);
            return o().catch(c);
        });
    };
    console.log("DEBUG: main.js loading...");
    window.handleFiles = P;
    let k, U, q, z;
    async function G() {}
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
    function J() {
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
        console.log("PicMerger v1.0.5 Initializing..."), await G(), J(), X(), console.log("Event listeners attached.");
        try {
            const { default: t, merge_images: o } = await V(async ()=>{
                const { default: a, merge_images: r } = await import("./pic_wasm-C60cSF7V.js");
                return {
                    default: a,
                    merge_images: r
                };
            }, [], import.meta.url);
            await t(), R = o, console.log("WASM engine loaded successfully.");
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
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.remove("drag-over"), console.log("Drop event triggered"), t.dataTransfer && t.dataTransfer.files && P(t.dataTransfer.files);
        }), e.fileInput.addEventListener("change", (t)=>{
            P(t.target.files);
        })) : console.error("Drop zone or file input not found!"), e.gridColsInput && e.gridColsInput.addEventListener("change", (t)=>{
            const o = n.images.length || 1;
            n.gridCols = Math.min(o, Math.max(1, parseInt(t.target.value) || 1)), t.target.value = n.gridCols, E();
        }), e.outputModeSelect && e.outputModeSelect.addEventListener("change", (t)=>{
            n.outputMode = t.target.value, n.outputScale = 100, M(), E();
        }), e.outputValueInput && e.outputValueInput.addEventListener("input", (t)=>{
            const o = parseFloat(t.target.value);
            if (!o) return;
            n.outputMode === "scale" ? n.outputScale = o : n.outputMode === "width" && n.baseWidth ? n.outputScale = o / n.baseWidth * 100 : n.outputMode === "height" && n.baseHeight && (n.outputScale = o / n.baseHeight * 100);
            const a = document.getElementById("output-value-label");
            a && (a.textContent = Math.round(o) + (n.outputMode === "scale" ? "%" : "px")), E();
        }), e.alignmentSelect && e.alignmentSelect.addEventListener("change", (t)=>{
            n.alignment = t.target.value, E();
        }), e.scaleModeSelect && e.scaleModeSelect.addEventListener("change", (t)=>{
            n.scaleMode = t.target.value, E();
        }), e.bgColorInput && e.bgColorInput.addEventListener("change", (t)=>{
            n.bgColor = t.target.value, E();
        }), e.btnMerge && e.btnMerge.addEventListener("click", async ()=>{
            n.images.length < 2 || (e.btnMerge.disabled = !0, e.btnMerge.textContent = "正在渲染畫布...", setTimeout(()=>{
                try {
                    Q();
                } catch (t) {
                    alert("渲染失敗: " + t.message);
                } finally{
                    e.btnMerge.disabled = !1, e.btnMerge.textContent = "生成合併圖";
                }
            }, 100));
        }), e.btnReset && e.btnReset.addEventListener("click", ne), e.btnSave && e.btnSave.addEventListener("click", ee), e.btnShare && e.btnShare.addEventListener("click", te), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
            n.images.length > 0 && Y();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", C), e.sortModal && e.sortModal.addEventListener("click", (t)=>{
            t.target === e.sortModal && C();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            C(), e.btnMerge && e.btnMerge.click();
        });
    }
    async function P(t) {
        if (!t || t.length === 0) return;
        e.previewInfo.textContent = "正在處理並修正圖片方向...";
        const o = [];
        for (const a of Array.from(t))if (a.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(a.name)) try {
            const s = await new Promise((c, l)=>{
                const i = new Image, f = URL.createObjectURL(a);
                i.onload = ()=>{
                    const u = document.createElement("canvas");
                    u.width = i.width, u.height = i.height, u.getContext("2d").drawImage(i, 0, 0, u.width, u.height), u.toBlob((h)=>{
                        const v = URL.createObjectURL(h), b = new Image;
                        b.onload = ()=>{
                            URL.revokeObjectURL(f), c({
                                img: b,
                                name: a.name,
                                width: b.width,
                                height: b.height,
                                src: v
                            });
                        }, b.src = v;
                    }, "image/png");
                }, i.onerror = ()=>{
                    URL.revokeObjectURL(f), l(new Error(`圖片讀取失敗: ${a.name}`));
                }, i.src = f;
            });
            o.push(s);
        } catch (s) {
            console.error(s);
        }
        o.length > 0 && (n.images = [
            ...n.images,
            ...o
        ], S(), e.previewInfo.textContent = `已載入 ${n.images.length} 張圖片。`, e.downloadSection.style.display = "none");
    }
    function S() {
        e.fileCount.textContent = n.images.length, e.imageList.innerHTML = "", n.images.forEach((t, o)=>{
            const a = document.createElement("div");
            a.className = "image-item", a.draggable = !0, a.dataset.index = o, a.innerHTML = `
            <img src="${t.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `, a.querySelector(".btn-remove").addEventListener("click", (r)=>{
                r.stopPropagation(), URL.revokeObjectURL(n.images[o].src), n.images.splice(o, 1), S(), e.downloadSection.style.display = "none";
            }), a.addEventListener("dragstart", T), a.addEventListener("dragover", W), a.addEventListener("drop", O), a.addEventListener("dragend", _), a.addEventListener("dragenter", $), a.addEventListener("dragleave", A), a.addEventListener("touchstart", H, {
                passive: !1
            }), a.addEventListener("touchmove", N, {
                passive: !1
            }), a.addEventListener("touchend", j, {
                passive: !1
            }), e.imageList.appendChild(a);
        }), e.btnMerge.disabled = n.images.length < 2;
    }
    function M() {
        if (!n.baseWidth || !n.baseHeight) return;
        const t = document.getElementById("output-value-label");
        let o = 100;
        n.outputMode === "scale" ? (e.outputValueInput.max = 100, o = Math.round(n.outputScale)) : n.outputMode === "width" ? (e.outputValueInput.max = n.baseWidth, o = Math.round(n.baseWidth * (n.outputScale / 100))) : n.outputMode === "height" && (e.outputValueInput.max = n.baseHeight, o = Math.round(n.baseHeight * (n.outputScale / 100))), e.outputValueInput.value = o, t && (t.textContent = o + (n.outputMode === "scale" ? "%" : "px"));
    }
    function Y() {
        B(), e.sortModal.classList.add("show"), document.body.style.overflow = "hidden";
    }
    function C() {
        e.sortModal.classList.remove("show"), document.body.style.overflow = "";
    }
    function B() {
        e.sortList.innerHTML = "", n.images.forEach((t, o)=>{
            const a = document.createElement("div");
            a.className = "sort-item", a.draggable = !0, a.dataset.index = o, a.innerHTML = `
            <img src="${t.src}" alt="Thumb" />
            <div class="info">${t.name}</div>
        `, a.addEventListener("dragstart", T), a.addEventListener("dragover", W), a.addEventListener("drop", O), a.addEventListener("dragend", _), a.addEventListener("dragenter", $), a.addEventListener("dragleave", A), a.addEventListener("touchstart", H, {
                passive: !1
            }), a.addEventListener("touchmove", N, {
                passive: !1
            }), a.addEventListener("touchend", j, {
                passive: !1
            }), e.sortList.appendChild(a);
        });
    }
    let w = null;
    function T(t) {
        w = parseInt(this.dataset.index), this.classList.add("dragging"), t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", w);
    }
    function W(t) {
        return t.preventDefault && t.preventDefault(), t.dataTransfer.dropEffect = "move", !1;
    }
    function $(t) {
        this.classList.add("drag-over");
    }
    function A(t) {
        this.classList.remove("drag-over");
    }
    function O(t) {
        t.stopPropagation && t.stopPropagation();
        const o = parseInt(this.dataset.index);
        if (w !== o) {
            const a = n.images.splice(w, 1)[0];
            n.images.splice(o, 0, a), S(), B(), e.downloadSection.style.display === "block" && E();
        }
        return !1;
    }
    function _(t) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((o)=>{
            o.classList.remove("drag-over");
        });
    }
    let L = null;
    function H(t) {
        t.touches.length === 1 && (w = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function N(t) {
        if (t.touches.length !== 1 || w === null) return;
        t.preventDefault();
        const o = t.touches[0];
        this.style.pointerEvents = "none";
        const a = document.elementFromPoint(o.clientX, o.clientY);
        this.style.pointerEvents = "auto";
        const r = a?.closest(".image-item, .sort-item");
        L && L !== r && L.classList.remove("drag-over"), r && r.dataset.index !== void 0 && parseInt(r.dataset.index) !== w ? (r.classList.add("drag-over"), L = r) : L = null;
    }
    function j(t) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", L) {
            const o = parseInt(L.dataset.index);
            if (L.classList.remove("drag-over"), w !== null && !isNaN(o) && w !== o) {
                const a = n.images.splice(w, 1)[0];
                n.images.splice(o, 0, a), S(), B(), e.downloadSection.style.display === "block" && E();
            }
        }
        L = null, w = null, document.querySelectorAll(".image-item, .sort-item").forEach((o)=>{
            o.classList.remove("dragging", "drag-over"), o.style.pointerEvents = "auto";
        });
    }
    function E() {
        if (n.images.length < 1) return;
        const t = n.images;
        let o = 0, a = 0;
        {
            const l = n.gridCols, i = Math.ceil(t.length / l);
            n.scaleMode === "fit-first" ? (o = t[0].width * l, a = t[0].height * i) : (o = Math.max(...t.map((f)=>f.width)) * l, a = Math.max(...t.map((f)=>f.height)) * i);
        }
        n.baseWidth = o, n.baseHeight = a;
        const r = n.outputScale / 100, s = o * r, c = a * r;
        e.canvas.width = s, e.canvas.height = c, e.canvas.style.width = s + "px", e.ctx.fillStyle = n.bgColor, e.ctx.fillRect(0, 0, s, c), e.ctx.save(), e.ctx.scale(r, r);
        {
            const l = n.gridCols, i = o / l, f = a / Math.ceil(t.length / l);
            t.forEach((u, g)=>{
                const h = Math.floor(g / l), v = g % l, b = i / u.width, d = f / u.height, m = (n.scaleMode === "fit-first", Math.min(b, d)), p = u.width * m, y = u.height * m;
                let I = v * i, x = h * f;
                n.alignment === "center" ? (I += (i - p) / 2, x += (f - y) / 2) : n.alignment === "end" && (I += i - p, x += f - y), e.ctx.drawImage(u.img, I, x, p, y);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(s)} x ${Math.round(c)} (${n.outputScale.toFixed(1)}%)`, M();
    }
    async function Q() {
        if (!(n.images.length < 1)) {
            e.previewInfo.textContent = "Rust 引擎正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const t = await Promise.all(n.images.map((m)=>fetch(m.src).then((p)=>p.arrayBuffer()))), o = new Uint8Array(t.reduce((m, p)=>m + p.byteLength, 0)), a = new Uint32Array(n.images.length * 2);
                let r = 0;
                t.forEach((m, p)=>{
                    const y = new Uint8Array(m);
                    o.set(y, r), a[p * 2] = r, a[p * 2 + 1] = r + y.length, r += y.length;
                });
                const s = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                }, c = {
                    start: 0,
                    center: 1,
                    end: 2
                }, l = parseInt(n.bgColor.slice(1, 3), 16), i = parseInt(n.bgColor.slice(3, 5), 16), f = parseInt(n.bgColor.slice(5, 7), 16), u = performance.now();
                let g;
                try {
                    if (!R) throw new Error("WASM_MISSING");
                    g = R(o, a, s[n.direction], c[n.alignment], n.gridCols, l, i, f);
                } catch (m) {
                    if (m.message === "WASM_MISSING" || m.toString().includes("WASM_MISSING")) {
                        console.info("使用 JS Fallback 引擎渲染..."), E();
                        const p = e.canvas.toDataURL("image/png"), y = await (await fetch(p)).blob(), I = URL.createObjectURL(y);
                        e.downloadSection.style.display = "block", e.previewInfo.textContent = `JS 引擎處理完成！解析度: ${e.canvas.width}x${e.canvas.height}`, e.btnMerge.disabled = !1, M();
                        return;
                    }
                    throw m;
                }
                const h = performance.now();
                console.log(`Rust 拼接耗時: ${(h - u).toFixed(2)}ms`);
                const v = new Blob([
                    g
                ], {
                    type: "image/png"
                }), b = URL.createObjectURL(v), d = new Image;
                d.onload = ()=>{
                    n.baseWidth = d.width, n.baseHeight = d.height, e.canvas.width = d.width, e.canvas.height = d.height, e.ctx.drawImage(d, 0, 0), e.downloadSection.style.display = "block", e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${d.width}x${d.height} (耗時 ${(h - u).toFixed(0)}ms)`, e.btnMerge.disabled = !1, M();
                }, d.src = b;
            } catch (t) {
                console.error("Rust 處理失敗:", t), e.previewInfo.textContent = "Rust 引擎發生錯誤: " + t, e.btnMerge.disabled = !1;
            }
        }
    }
    async function ee() {
        try {
            e.btnSave.disabled = !0, e.btnSave.textContent = "正在儲存至外部儲存...";
            const t = e.canvas.toDataURL("image/png", .9);
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const o = t.split(",")[1], a = `PicMerger_${Date.now()}.png`;
                await k.writeFile({
                    path: `PicMerger/${a}`,
                    data: o,
                    directory: U.Documents,
                    recursive: !0
                }), await z.show({
                    text: `儲存成功！路徑：文件/PicMerger/${a}`,
                    duration: "long"
                }), e.btnSave.textContent = "✅ 已儲存至文件", alert(`儲存成功！
圖片已存於「文件/PicMerger/」資料夾中。
若相簿未立即出現，請手動前往查看或使用分享按鈕。`);
            } else {
                const o = document.createElement("a");
                o.href = t, o.download = `PicMerger_${Date.now()}.png`, o.click(), e.btnSave.textContent = "💾 儲存成功";
            }
        } catch (t) {
            console.error("儲存失敗:", t), alert("儲存失敗: " + t.message), e.btnSave.textContent = "❌ 儲存失敗";
        } finally{
            setTimeout(()=>{
                e.btnSave.disabled = !1, e.btnSave.textContent = "💾 直接儲存至文件資料夾";
            }, 3e3);
        }
    }
    async function te() {
        try {
            e.btnShare.disabled = !0, e.btnShare.textContent = "正在準備分享...";
            const t = e.canvas.toDataURL("image/png", .9), o = `PicMerger_Share_${Date.now()}.png`;
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const a = t.split(",")[1], r = await k.writeFile({
                    path: o,
                    data: a,
                    directory: U.Cache
                });
                await q.share({
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
    function ne() {
        n.images.forEach((t)=>URL.revokeObjectURL(t.src)), n.images = [], S(), e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height), e.previewInfo.textContent = "請上傳圖片以開始", e.downloadSection.style.display = "none", e.fileInput.value = "";
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
