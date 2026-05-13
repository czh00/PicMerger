(async ()=>{
    (function() {
        const o = document.createElement("link").relList;
        if (o && o.supports && o.supports("modulepreload")) return;
        for (const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);
        new MutationObserver((i)=>{
            for (const c of i)if (c.type === "childList") for (const l of c.addedNodes)l.tagName === "LINK" && l.rel === "modulepreload" && r(l);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function t(i) {
            const c = {};
            return i.integrity && (c.integrity = i.integrity), i.referrerPolicy && (c.referrerPolicy = i.referrerPolicy), i.crossOrigin === "use-credentials" ? c.credentials = "include" : i.crossOrigin === "anonymous" ? c.credentials = "omit" : c.credentials = "same-origin", c;
        }
        function r(i) {
            if (i.ep) return;
            i.ep = !0;
            const c = t(i);
            fetch(i.href, c);
        }
    })();
    const q = "modulepreload", Z = function(n, o) {
        return new URL(n, o).href;
    }, k = {}, G = function(o, t, r) {
        let i = Promise.resolve();
        if (t && t.length > 0) {
            let l = function(g) {
                return Promise.all(g.map((h)=>Promise.resolve(h).then((v)=>({
                            status: "fulfilled",
                            value: v
                        }), (v)=>({
                            status: "rejected",
                            reason: v
                        }))));
            };
            const s = document.getElementsByTagName("link"), f = document.querySelector("meta[property=csp-nonce]"), u = f?.nonce || f?.getAttribute("nonce");
            i = l(t.map((g)=>{
                if (g = Z(g, r), g in k) return;
                k[g] = !0;
                const h = g.endsWith(".css"), v = h ? '[rel="stylesheet"]' : "";
                if (!!r) for(let m = s.length - 1; m >= 0; m--){
                    const p = s[m];
                    if (p.href === g && (!h || p.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${g}"]${v}`)) return;
                const d = document.createElement("link");
                if (d.rel = h ? "stylesheet" : q, h || (d.as = "script"), d.crossOrigin = "", d.href = g, u && d.setAttribute("nonce", u), document.head.appendChild(d), h) return new Promise((m, p)=>{
                    d.addEventListener("load", m), d.addEventListener("error", ()=>p(new Error(`Unable to preload CSS for ${g}`)));
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
            return o().catch(c);
        });
    };
    console.log("DEBUG: main.js loading...");
    window.handleFiles = B;
    let D, U, V, z;
    async function J() {}
    let P = null;
    const a = {
        images: [],
        direction: "grid",
        alignment: "center",
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
        }, console.log("Elements initialized:", Object.keys(e).filter((n)=>e[n]));
    }
    async function K() {
        console.log("PicMerger v1.0.5 Initializing..."), J(), T(), e.btnShare && (window.Capacitor && window.Capacitor.isNativePlatform() && a.canShare ? (e.btnShare.style.setProperty("display", "block", "important"), e.btnShare.disabled = !1) : e.btnShare.style.setProperty("display", "none", "important")), X(), console.log("Event listeners attached.");
        try {
            const { default: n, merge_images: o } = await G(async ()=>{
                const { default: t, merge_images: r } = await import("./pic_wasm-C60cSF7V.js");
                return {
                    default: t,
                    merge_images: r
                };
            }, [], import.meta.url);
            await n(), P = o, console.log("WASM engine loaded successfully.");
        } catch (n) {
            console.warn("WASM 載入跳過 (採用 JS 降級引擎):", n);
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
            a.gridCols = parseInt(t.target.value) || 1;
            const r = document.getElementById("grid-cols-value");
            r && (r.textContent = a.gridCols), y();
        });
        const n = document.getElementById("alignment-group");
        n && n.querySelectorAll("button").forEach((t)=>{
            t.addEventListener("click", ()=>{
                a.alignment = t.dataset.value, n.querySelectorAll("button").forEach((r)=>r.classList.remove("active")), t.classList.add("active"), y();
            });
        });
        const o = document.getElementById("output-mode-group");
        o && o.querySelectorAll("button").forEach((t)=>{
            t.addEventListener("click", ()=>{
                a.outputMode = t.dataset.value, a.outputScale = 100, o.querySelectorAll("button").forEach((r)=>r.classList.remove("active")), t.classList.add("active"), M(), y();
            });
        }), e.outputValueInput && e.outputValueInput.addEventListener("input", (t)=>{
            const r = parseFloat(t.target.value);
            if (!r) return;
            a.outputMode === "scale" ? a.outputScale = r : a.outputMode === "width" && a.baseWidth ? a.outputScale = r / a.baseWidth * 100 : a.outputMode === "height" && a.baseHeight && (a.outputScale = r / a.baseHeight * 100);
            const i = document.getElementById("output-value-label");
            i && (i.textContent = Math.round(r) + (a.outputMode === "scale" ? "%" : "px")), y();
        }), e.alignmentSelect && e.alignmentSelect.addEventListener("change", (t)=>{
            a.alignment = t.target.value, y();
        }), e.scaleModeSelect && e.scaleModeSelect.addEventListener("change", (t)=>{
            a.scaleMode = t.target.value, y();
        }), e.bgColorInput && e.bgColorInput.addEventListener("change", (t)=>{
            a.bgColor = t.target.value, y();
        }), e.btnMerge && e.btnMerge.addEventListener("click", async ()=>{
            a.images.length < 2 || (e.btnMerge.disabled = !0, e.btnMerge.textContent = "正在渲染畫布...", setTimeout(()=>{
                try {
                    ee();
                } catch (t) {
                    alert("渲染失敗: " + t.message);
                } finally{
                    e.btnMerge.disabled = !1, e.btnMerge.textContent = "生成合併圖";
                }
            }, 100));
        }), e.btnReset && e.btnReset.addEventListener("click", ae), e.btnSave && e.btnSave.addEventListener("click", te), e.btnShare && e.btnShare.addEventListener("click", ne), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
            a.images.length > 0 && Q();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", x), e.sortModal && e.sortModal.addEventListener("click", (t)=>{
            t.target === e.sortModal && x();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            x(), e.btnMerge && e.btnMerge.click();
        });
    }
    async function B(n) {
        if (console.log("Handling files:", n ? n.length : 0), !n || n.length === 0) return;
        (!e || !e.imageList) && (console.log("Lazy-initializing elements..."), T()), e.previewInfo && (e.previewInfo.textContent = "正在處理並修正圖片方向...");
        const o = [];
        for (const t of Array.from(n))if (t.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(t.name)) try {
            const i = await new Promise((c, l)=>{
                const s = new Image, f = URL.createObjectURL(t);
                s.onload = ()=>{
                    const u = document.createElement("canvas");
                    u.width = s.width, u.height = s.height, u.getContext("2d").drawImage(s, 0, 0, u.width, u.height), u.toBlob((h)=>{
                        const v = URL.createObjectURL(h), b = new Image;
                        b.onload = ()=>{
                            URL.revokeObjectURL(f), c({
                                img: b,
                                name: t.name,
                                width: b.width,
                                height: b.height,
                                src: v
                            });
                        }, b.src = v;
                    }, "image/png");
                }, s.onerror = ()=>{
                    URL.revokeObjectURL(f), l(new Error(`圖片讀取失敗: ${t.name}`));
                }, s.src = f;
            });
            o.push(i);
        } catch (i) {
            console.error(i);
        }
        o.length > 0 && (a.images = [
            ...a.images,
            ...o
        ], L(), e.previewInfo.textContent = `已載入 ${a.images.length} 張圖片。`, e.downloadSection.style.display = "none", setTimeout(()=>{
            console.log("Auto-triggering preview..."), y();
        }, 100));
    }
    function L() {
        e.fileCount.textContent = a.images.length, e.imageList.innerHTML = "", a.images.forEach((n, o)=>{
            const t = document.createElement("div");
            t.className = "image-item", t.draggable = !0, t.dataset.index = o, t.innerHTML = `
            <img src="${n.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `, t.querySelector(".btn-remove").addEventListener("click", (r)=>{
                r.stopPropagation(), URL.revokeObjectURL(a.images[o].src), a.images.splice(o, 1), L(), e.downloadSection.style.display = "none";
            }), t.addEventListener("dragstart", W), t.addEventListener("dragover", A), t.addEventListener("drop", O), t.addEventListener("dragend", H), t.addEventListener("dragenter", N), t.addEventListener("dragleave", $), t.addEventListener("touchstart", _, {
                passive: !1
            }), t.addEventListener("touchmove", j, {
                passive: !1
            }), t.addEventListener("touchend", F, {
                passive: !1
            }), e.imageList.appendChild(t);
        }), e.btnMerge.disabled = a.images.length < 2, Y();
    }
    function Y() {
        if (e.gridColsInput) {
            const n = a.images.length || 1;
            console.log("Updating Grid Max to:", n), e.gridColsInput.max = n, a.gridCols > n && (a.gridCols = n, e.gridColsInput.value = n);
            const o = document.getElementById("grid-cols-value");
            o && (o.textContent = a.gridCols);
        } else console.warn("Grid input not found during update");
    }
    function M() {
        if (!a.baseWidth || !a.baseHeight) return;
        const n = document.getElementById("output-value-label");
        let o = 100;
        a.outputMode === "scale" ? (e.outputValueInput.max = 100, o = Math.round(a.outputScale)) : a.outputMode === "width" ? (e.outputValueInput.max = a.baseWidth, o = Math.round(a.baseWidth * (a.outputScale / 100))) : a.outputMode === "height" && (e.outputValueInput.max = a.baseHeight, o = Math.round(a.baseHeight * (a.outputScale / 100))), e.outputValueInput.value = o, n && (n.textContent = o + (a.outputMode === "scale" ? "%" : "px"));
    }
    function Q() {
        R(), e.sortModal.classList.add("show"), document.body.style.overflow = "hidden";
    }
    function x() {
        e.sortModal.classList.remove("show"), document.body.style.overflow = "";
    }
    function R() {
        e.sortList.innerHTML = "", a.images.forEach((n, o)=>{
            const t = document.createElement("div");
            t.className = "sort-item", t.draggable = !0, t.dataset.index = o, t.innerHTML = `
            <img src="${n.src}" alt="Thumb" />
            <div class="info">${n.name}</div>
        `, t.addEventListener("dragstart", W), t.addEventListener("dragover", A), t.addEventListener("drop", O), t.addEventListener("dragend", H), t.addEventListener("dragenter", N), t.addEventListener("dragleave", $), t.addEventListener("touchstart", _, {
                passive: !1
            }), t.addEventListener("touchmove", j, {
                passive: !1
            }), t.addEventListener("touchend", F, {
                passive: !1
            }), e.sortList.appendChild(t);
        });
    }
    let w = null;
    function W(n) {
        w = parseInt(this.dataset.index), this.classList.add("dragging"), n.dataTransfer.effectAllowed = "move", n.dataTransfer.setData("text/plain", w);
    }
    function A(n) {
        return n.preventDefault && n.preventDefault(), n.dataTransfer.dropEffect = "move", !1;
    }
    function N(n) {
        this.classList.add("drag-over");
    }
    function $(n) {
        this.classList.remove("drag-over");
    }
    function O(n) {
        n.stopPropagation && n.stopPropagation();
        const o = parseInt(this.dataset.index);
        if (w !== o) {
            const t = a.images.splice(w, 1)[0];
            a.images.splice(o, 0, t), L(), R(), e.downloadSection.style.display === "block" && y();
        }
        return !1;
    }
    function H(n) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((o)=>{
            o.classList.remove("drag-over");
        });
    }
    let S = null;
    function _(n) {
        n.touches.length === 1 && (w = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function j(n) {
        if (n.touches.length !== 1 || w === null) return;
        n.preventDefault();
        const o = n.touches[0];
        this.style.pointerEvents = "none";
        const t = document.elementFromPoint(o.clientX, o.clientY);
        this.style.pointerEvents = "auto";
        const r = t?.closest(".image-item, .sort-item");
        S && S !== r && S.classList.remove("drag-over"), r && r.dataset.index !== void 0 && parseInt(r.dataset.index) !== w ? (r.classList.add("drag-over"), S = r) : S = null;
    }
    function F(n) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", S) {
            const o = parseInt(S.dataset.index);
            if (S.classList.remove("drag-over"), w !== null && !isNaN(o) && w !== o) {
                const t = a.images.splice(w, 1)[0];
                a.images.splice(o, 0, t), L(), R(), e.downloadSection.style.display === "block" && y();
            }
        }
        S = null, w = null, document.querySelectorAll(".image-item, .sort-item").forEach((o)=>{
            o.classList.remove("dragging", "drag-over"), o.style.pointerEvents = "auto";
        });
    }
    function y() {
        if (a.images.length < 1) return;
        const n = a.images;
        let o = 0, t = 0;
        {
            const l = a.gridCols, s = Math.ceil(n.length / l);
            a.scaleMode === "fit-first" ? (o = n[0].width * l, t = n[0].height * s) : (o = Math.max(...n.map((f)=>f.width)) * l, t = Math.max(...n.map((f)=>f.height)) * s);
        }
        a.baseWidth = o, a.baseHeight = t;
        const r = a.outputScale / 100, i = o * r, c = t * r;
        e.canvas.width = i, e.canvas.height = c, e.canvas.style.width = i + "px", e.ctx.fillStyle = a.bgColor, e.ctx.fillRect(0, 0, i, c), e.ctx.save(), e.ctx.scale(r, r);
        {
            const l = a.gridCols, s = o / l, f = t / Math.ceil(n.length / l);
            n.forEach((u, g)=>{
                const h = Math.floor(g / l), v = g % l, b = s / u.width, d = f / u.height, m = (a.scaleMode === "fit-first", Math.min(b, d)), p = u.width * m, E = u.height * m;
                let I = v * s, C = h * f;
                a.alignment === "center" ? (I += (s - p) / 2, C += (f - E) / 2) : a.alignment === "end" && (I += s - p, C += f - E), e.ctx.drawImage(u.img, I, C, p, E);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(i)} x ${Math.round(c)} (${a.outputScale.toFixed(1)}%)`, M();
    }
    async function ee() {
        if (!(a.images.length < 1)) {
            e.previewInfo.textContent = "Rust 引擎正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const n = await Promise.all(a.images.map((m)=>fetch(m.src).then((p)=>p.arrayBuffer()))), o = new Uint8Array(n.reduce((m, p)=>m + p.byteLength, 0)), t = new Uint32Array(a.images.length * 2);
                let r = 0;
                n.forEach((m, p)=>{
                    const E = new Uint8Array(m);
                    o.set(E, r), t[p * 2] = r, t[p * 2 + 1] = r + E.length, r += E.length;
                });
                const i = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                }, c = {
                    start: 0,
                    center: 1,
                    end: 2
                }, l = parseInt(a.bgColor.slice(1, 3), 16), s = parseInt(a.bgColor.slice(3, 5), 16), f = parseInt(a.bgColor.slice(5, 7), 16), u = performance.now();
                let g;
                try {
                    if (!P) throw new Error("WASM_MISSING");
                    g = P(o, t, i[a.direction], c[a.alignment], a.gridCols, l, s, f);
                } catch (m) {
                    if (m.message === "WASM_MISSING" || m.toString().includes("WASM_MISSING")) {
                        console.info("使用 JS Fallback 引擎渲染..."), y();
                        const p = e.canvas.toDataURL("image/png"), E = await (await fetch(p)).blob(), I = URL.createObjectURL(E);
                        e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !a.canShare), e.previewInfo.textContent = `JS 引擎處理完成！解析度: ${e.canvas.width}x${e.canvas.height}`, e.btnMerge.disabled = !1, M();
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
                    a.baseWidth = d.width, a.baseHeight = d.height, e.canvas.width = d.width, e.canvas.height = d.height, e.ctx.drawImage(d, 0, 0), e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !a.canShare), e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${d.width}x${d.height} (耗時 ${(h - u).toFixed(0)}ms)`, e.btnMerge.disabled = !1, M();
                }, d.src = b;
            } catch (n) {
                console.error("Rust 處理失敗:", n), e.previewInfo.textContent = "Rust 引擎發生錯誤: " + n, e.btnMerge.disabled = !1;
            }
        }
    }
    async function te() {
        try {
            e.btnSave.disabled = !0, e.btnSave.textContent = "正在儲存至外部儲存...";
            const n = e.canvas.toDataURL("image/png", .9);
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const o = n.split(",")[1], t = `PicMerger_${Date.now()}.png`;
                await D.writeFile({
                    path: `PicMerger/${t}`,
                    data: o,
                    directory: U.Documents,
                    recursive: !0
                }), await z.show({
                    text: `儲存成功！路徑：文件/PicMerger/${t}`,
                    duration: "long"
                }), e.btnSave.textContent = "✅ 已儲存至文件", alert(`儲存成功！
圖片已存於「文件/PicMerger/」資料夾中。
若相簿未立即出現，請手動前往查看或使用分享按鈕。`);
            } else {
                const o = document.createElement("a");
                o.href = n, o.download = `PicMerger_${Date.now()}.png`, o.click(), e.btnSave.textContent = "💾 儲存成功";
            }
        } catch (n) {
            console.error("儲存失敗:", n), alert("儲存失敗: " + n.message), e.btnSave.textContent = "❌ 儲存失敗";
        } finally{
            setTimeout(()=>{
                e.btnSave.disabled = !1, e.btnSave.textContent = "💾 直接儲存至文件資料夾", e.btnShare && (e.btnShare.disabled = !a.canShare);
            }, 3e3);
        }
    }
    async function ne() {
        try {
            e.btnShare.disabled = !0, e.btnShare.textContent = "正在準備分享...";
            const n = e.canvas.toDataURL("image/png", .9), o = `PicMerger_Share_${Date.now()}.png`;
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const t = n.split(",")[1], r = await D.writeFile({
                    path: o,
                    data: t,
                    directory: U.Cache
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
                e.btnShare && (!(window.Capacitor && window.Capacitor.isNativePlatform()) || !a.canShare ? e.btnShare.style.setProperty("display", "none", "important") : (e.btnShare.disabled = !1, e.btnShare.textContent = "🔗 分享圖片至其他 App"));
            }, 3e3);
        }
    }
    function ae() {
        a.images.forEach((n)=>URL.revokeObjectURL(n.src)), a.images = [], L(), e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height), e.previewInfo.textContent = "請上傳圖片以開始", e.downloadSection.style.display = "none", e.fileInput.value = "";
    }
    window.addEventListener("dragover", (n)=>n.preventDefault(), !1);
    window.addEventListener("drop", (n)=>n.preventDefault(), !1);
    "serviceWorker" in navigator && window.addEventListener("load", ()=>{
        try {
            navigator.serviceWorker.register("sw.js").catch((n)=>console.warn("SW register failed (ignored)"));
        } catch  {}
    });
    K();
})();
