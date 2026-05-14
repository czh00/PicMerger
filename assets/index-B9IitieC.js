(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);
        new MutationObserver((s)=>{
            for (const c of s)if (c.type === "childList") for (const f of c.addedNodes)f.tagName === "LINK" && f.rel === "modulepreload" && r(f);
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
    const j = "modulepreload", z = function(n, t) {
        return new URL(n, t).href;
    }, R = {}, F = function(t, a, r) {
        let s = Promise.resolve();
        if (a && a.length > 0) {
            let f = function(i) {
                return Promise.all(i.map((d)=>Promise.resolve(d).then((h)=>({
                            status: "fulfilled",
                            value: h
                        }), (h)=>({
                            status: "rejected",
                            reason: h
                        }))));
            };
            const u = document.getElementsByTagName("link"), p = document.querySelector("meta[property=csp-nonce]"), l = p?.nonce || p?.getAttribute("nonce");
            s = f(a.map((i)=>{
                if (i = z(i, r), i in R) return;
                R[i] = !0;
                const d = i.endsWith(".css"), h = d ? '[rel="stylesheet"]' : "";
                if (!!r) for(let m = u.length - 1; m >= 0; m--){
                    const b = u[m];
                    if (b.href === i && (!d || b.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${i}"]${h}`)) return;
                const g = document.createElement("link");
                if (g.rel = d ? "stylesheet" : j, d || (g.as = "script"), g.crossOrigin = "", g.href = i, l && g.setAttribute("nonce", l), document.head.appendChild(g), d) return new Promise((m, b)=>{
                    g.addEventListener("load", m), g.addEventListener("error", ()=>b(new Error(`Unable to preload CSS for ${i}`)));
                });
            }));
        }
        function c(f) {
            const u = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (u.payload = f, window.dispatchEvent(u), !u.defaultPrevented) throw f;
        }
        return s.then((f)=>{
            for (const u of f || [])u.status === "rejected" && c(u.reason);
            return t().catch(c);
        });
    };
    console.log("DEBUG: main.js loading...");
    window.handleFiles = x;
    let D, B, V, Z;
    async function q() {}
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
    async function G() {
        console.log("PicMerger v1.0.10 Initializing..."), q(), k(), e.btnShare && (window.Capacitor && window.Capacitor.isNativePlatform() && o.canShare ? (e.btnShare.style.setProperty("display", "block", "important"), e.btnShare.disabled = !1) : e.btnShare.style.setProperty("display", "none", "important")), J(), console.log("Event listeners attached.");
        try {
            const { default: n, merge_images: t } = await F(async ()=>{
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
                    Q();
                } catch (t) {
                    alert("渲染失敗: " + t.message);
                } finally{
                    e.btnMerge.disabled = !1, e.btnMerge.textContent = "生成合併圖";
                }
            }, 100));
        }), e.btnReset && e.btnReset.addEventListener("click", ne), e.btnSave && e.btnSave.addEventListener("click", ee), e.btnShare && e.btnShare.addEventListener("click", te), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
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
            const s = await new Promise((c, f)=>{
                const u = new Image, p = URL.createObjectURL(a);
                u.onload = ()=>{
                    const l = document.createElement("canvas");
                    l.width = u.width, l.height = u.height, l.getContext("2d").drawImage(u, 0, 0, l.width, l.height), l.toBlob((d)=>{
                        const h = URL.createObjectURL(d), v = new Image;
                        v.onload = ()=>{
                            URL.revokeObjectURL(p), c({
                                img: v,
                                name: a.name,
                                width: v.width,
                                height: v.height,
                                src: h
                            });
                        }, v.src = h;
                    }, "image/png");
                }, u.onerror = ()=>{
                    URL.revokeObjectURL(p), f(new Error(`圖片讀取失敗: ${a.name}`));
                }, u.src = p;
            });
            t.push(s);
        } catch (s) {
            console.error(s);
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
            }), a.addEventListener("touchmove", H, {
                passive: !1
            }), a.addEventListener("touchend", _, {
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
            }), a.addEventListener("touchmove", H, {
                passive: !1
            }), a.addEventListener("touchend", _, {
                passive: !1
            }), e.sortList.appendChild(a);
        });
    }
    let w = null;
    function U(n) {
        w = parseInt(this.dataset.index), this.classList.add("dragging"), n.dataTransfer.effectAllowed = "move", n.dataTransfer.setData("text/plain", w);
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
        if (w !== t) {
            const a = o.images.splice(w, 1)[0];
            o.images.splice(t, 0, a), S(), P(), e.downloadSection.style.display === "block" && E();
        }
        return !1;
    }
    function $(n) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("drag-over");
        });
    }
    let y = null;
    function O(n) {
        n.touches.length === 1 && (w = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function H(n) {
        if (n.touches.length !== 1 || w === null) return;
        n.preventDefault();
        const t = n.touches[0];
        this.style.pointerEvents = "none";
        const a = document.elementFromPoint(t.clientX, t.clientY);
        this.style.pointerEvents = "auto";
        const r = a?.closest(".image-item, .sort-item");
        y && y !== r && y.classList.remove("drag-over"), r && r.dataset.index !== void 0 && parseInt(r.dataset.index) !== w ? (r.classList.add("drag-over"), y = r) : y = null;
    }
    function _(n) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", y) {
            const t = parseInt(y.dataset.index);
            if (y.classList.remove("drag-over"), w !== null && !isNaN(t) && w !== t) {
                const a = o.images.splice(w, 1)[0];
                o.images.splice(t, 0, a), S(), P(), e.downloadSection.style.display === "block" && E();
            }
        }
        y = null, w = null, document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("dragging", "drag-over"), t.style.pointerEvents = "auto";
        });
    }
    function Y(n, t, a, r, s, c) {
        const f = t.width / t.height, u = s / c;
        let p, l, i, d;
        f > u ? (d = t.height, i = d * u, p = (t.width - i) / 2, l = 0) : (i = t.width, d = i / u, p = 0, l = (t.height - d) / 2), n.drawImage(t, p, l, i, d, a, r, s, c);
    }
    function E() {
        if (o.images.length < 1) return;
        const n = o.images;
        let t = 0, a = 0;
        const r = o.gridCols, s = n.length;
        let c = o.direction;
        if (r === 1 ? c = "vertical" : r === s && (c = "horizontal"), c === "horizontal") {
            const l = o.scaleMode === "fit-first" ? n[0].height : Math.max(...n.map((i)=>i.height));
            a = l, t = n.reduce((i, d)=>i + d.width * (l / d.height), 0);
        } else if (c === "vertical") {
            const l = o.scaleMode === "fit-first" ? n[0].width : Math.max(...n.map((i)=>i.width));
            t = l, a = n.reduce((i, d)=>i + d.height * (l / d.width), 0);
        } else {
            const l = Math.ceil(s / r);
            o.scaleMode === "fit-first" ? (t = n[0].width * r, a = n[0].height * l) : (t = Math.max(...n.map((i)=>i.width)) * r, a = Math.max(...n.map((i)=>i.height)) * l);
        }
        o.baseWidth = t, o.baseHeight = a;
        const f = o.outputScale / 100, u = t * f, p = a * f;
        if (e.canvas.width = u, e.canvas.height = p, e.canvas.style.width = u + "px", e.ctx.fillStyle = o.bgColor, e.ctx.fillRect(0, 0, u, p), e.ctx.save(), e.ctx.scale(f, f), c === "grid") {
            const l = Math.ceil(s / r), i = t / r, d = a / l;
            n.forEach((h, v)=>{
                const g = Math.floor(v / r), m = v % r;
                Y(e.ctx, h.img, m * i, g * d, i, d);
            });
        } else {
            let l = 0;
            n.forEach((i)=>{
                let d, h, v, g;
                c === "horizontal" ? (h = a, d = i.width * (a / i.height), v = l, g = 0, l += d) : (d = t, h = i.height * (t / i.width), v = 0, g = l, l += h), e.ctx.drawImage(i.img, v, g, d, h);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(u)} x ${Math.round(p)}`, I();
    }
    async function Q() {
        if (!(o.images.length < 1)) {
            e.previewInfo.textContent = "Rust 引擎正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const n = await Promise.all(o.images.map((m)=>fetch(m.src).then((b)=>b.arrayBuffer()))), t = new Uint8Array(n.reduce((m, b)=>m + b.byteLength, 0)), a = new Uint32Array(o.images.length * 2);
                let r = 0;
                n.forEach((m, b)=>{
                    const L = new Uint8Array(m);
                    t.set(L, r), a[b * 2] = r, a[b * 2 + 1] = r + L.length, r += L.length;
                });
                const s = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                };
                let c = s[o.direction];
                o.direction === "grid" && (o.gridCols === 1 ? c = s.vertical : o.gridCols === o.images.length && (c = s.horizontal));
                const f = parseInt(o.bgColor.slice(1, 3), 16), u = parseInt(o.bgColor.slice(3, 5), 16), p = parseInt(o.bgColor.slice(5, 7), 16), l = performance.now();
                let i;
                try {
                    if (!C) throw new Error("WASM_MISSING");
                    i = C(t, a, c, 1, o.gridCols, f, u, p);
                } catch (m) {
                    if (m.message === "WASM_MISSING" || m.toString().includes("WASM_MISSING")) {
                        console.info("使用 JS Fallback 引擎渲染..."), E();
                        const b = e.canvas.toDataURL("image/png"), L = await (await fetch(b)).blob(), ae = URL.createObjectURL(L);
                        e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `JS 引擎處理完成！解析度: ${e.canvas.width}x${e.canvas.height}`, e.btnMerge.disabled = !1, I();
                        return;
                    }
                    throw m;
                }
                const d = performance.now();
                console.log(`Rust 拼接耗時: ${(d - l).toFixed(2)}ms`);
                const h = new Blob([
                    i
                ], {
                    type: "image/png"
                }), v = URL.createObjectURL(h), g = new Image;
                g.onload = ()=>{
                    o.baseWidth = g.width, o.baseHeight = g.height, e.canvas.width = g.width, e.canvas.height = g.height, e.ctx.drawImage(g, 0, 0), e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${g.width}x${g.height} (耗時 ${(d - l).toFixed(0)}ms)`, e.btnMerge.disabled = !1, I();
                }, g.src = v;
            } catch (n) {
                console.error("Rust 處理失敗:", n), e.previewInfo.textContent = "Rust 引擎發生錯誤: " + n, e.btnMerge.disabled = !1;
            }
        }
    }
    async function ee() {
        try {
            e.btnSave.disabled = !0, e.btnSave.textContent = "正在儲存至外部儲存...";
            const n = e.canvas.toDataURL("image/png", .9);
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const t = n.split(",")[1], a = `PicMerger_${Date.now()}.png`;
                await D.writeFile({
                    path: `PicMerger/${a}`,
                    data: t,
                    directory: B.Documents,
                    recursive: !0
                }), await Z.show({
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
    async function te() {
        try {
            e.btnShare.disabled = !0, e.btnShare.textContent = "正在準備分享...";
            const n = e.canvas.toDataURL("image/png", .9), t = `PicMerger_Share_${Date.now()}.png`;
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const a = n.split(",")[1], r = await D.writeFile({
                    path: t,
                    data: a,
                    directory: B.Cache
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
    function ne() {
        o.images.forEach((n)=>URL.revokeObjectURL(n.src)), o.images = [], S(), e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height), e.previewInfo.textContent = "請上傳圖片以開始", e.downloadSection.style.display = "none", e.fileInput.value = "";
    }
    window.addEventListener("dragover", (n)=>n.preventDefault(), !1);
    window.addEventListener("drop", (n)=>n.preventDefault(), !1);
    "serviceWorker" in navigator && window.addEventListener("load", ()=>{
        try {
            navigator.serviceWorker.register("sw.js").catch((n)=>console.warn("SW register failed (ignored)"));
        } catch  {}
    });
    G();
})();
