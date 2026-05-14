(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);
        new MutationObserver((l)=>{
            for (const d of l)if (d.type === "childList") for (const f of d.addedNodes)f.tagName === "LINK" && f.rel === "modulepreload" && i(f);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function a(l) {
            const d = {};
            return l.integrity && (d.integrity = l.integrity), l.referrerPolicy && (d.referrerPolicy = l.referrerPolicy), l.crossOrigin === "use-credentials" ? d.credentials = "include" : l.crossOrigin === "anonymous" ? d.credentials = "omit" : d.credentials = "same-origin", d;
        }
        function i(l) {
            if (l.ep) return;
            l.ep = !0;
            const d = a(l);
            fetch(l.href, d);
        }
    })();
    const F = "modulepreload", V = function(n, t) {
        return new URL(n, t).href;
    }, R = {}, Z = function(t, a, i) {
        let l = Promise.resolve();
        if (a && a.length > 0) {
            let f = function(r) {
                return Promise.all(r.map((c)=>Promise.resolve(c).then((m)=>({
                            status: "fulfilled",
                            value: m
                        }), (m)=>({
                            status: "rejected",
                            reason: m
                        }))));
            };
            const g = document.getElementsByTagName("link"), b = document.querySelector("meta[property=csp-nonce]"), s = b?.nonce || b?.getAttribute("nonce");
            l = f(a.map((r)=>{
                if (r = V(r, i), r in R) return;
                R[r] = !0;
                const c = r.endsWith(".css"), m = c ? '[rel="stylesheet"]' : "";
                if (!!i) for(let h = g.length - 1; h >= 0; h--){
                    const v = g[h];
                    if (v.href === r && (!c || v.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${r}"]${m}`)) return;
                const u = document.createElement("link");
                if (u.rel = c ? "stylesheet" : F, c || (u.as = "script"), u.crossOrigin = "", u.href = r, s && u.setAttribute("nonce", s), document.head.appendChild(u), c) return new Promise((h, v)=>{
                    u.addEventListener("load", h), u.addEventListener("error", ()=>v(new Error(`Unable to preload CSS for ${r}`)));
                });
            }));
        }
        function d(f) {
            const g = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (g.payload = f, window.dispatchEvent(g), !g.defaultPrevented) throw f;
        }
        return l.then((f)=>{
            for (const g of f || [])g.status === "rejected" && d(g.reason);
            return t().catch(d);
        });
    };
    console.log("DEBUG: main.js loading...");
    window.handleFiles = x;
    let B, k, q, G;
    async function J() {}
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
    function U() {
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
    async function K() {
        console.log("PicMerger v1.0.10 Initializing..."), J(), U(), e.btnShare && (window.Capacitor && window.Capacitor.isNativePlatform() && o.canShare ? (e.btnShare.style.setProperty("display", "block", "important"), e.btnShare.disabled = !1) : e.btnShare.style.setProperty("display", "none", "important")), X(), console.log("Event listeners attached.");
        try {
            const { default: n, merge_images: t } = await Z(async ()=>{
                const { default: a, merge_images: i } = await import("./pic_wasm-C60cSF7V.js");
                return {
                    default: a,
                    merge_images: i
                };
            }, [], import.meta.url);
            await n(), C = t, console.log("WASM engine loaded successfully.");
        } catch (n) {
            console.warn("WASM 載入跳過 (採用 JS 降級引擎):", n);
        }
    }
    function X() {
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
            const i = document.getElementById("output-value-label");
            i && (i.textContent = Math.round(a) + (o.outputMode === "scale" ? "%" : "px")), E();
        }), e.scaleModeSelect && e.scaleModeSelect.addEventListener("change", (t)=>{
            o.scaleMode = t.target.value, E();
        }), e.bgColorInput && e.bgColorInput.addEventListener("change", (t)=>{
            o.bgColor = t.target.value, E();
        }), e.btnMerge && e.btnMerge.addEventListener("click", async ()=>{
            o.images.length < 2 || (e.btnMerge.disabled = !0, e.btnMerge.textContent = "正在渲染畫布...", setTimeout(()=>{
                try {
                    ee();
                } catch (t) {
                    alert("渲染失敗: " + t.message);
                } finally{
                    e.btnMerge.disabled = !1, e.btnMerge.textContent = "生成合併圖";
                }
            }, 100));
        }), e.btnReset && e.btnReset.addEventListener("click", ae), e.btnSave && e.btnSave.addEventListener("click", te), e.btnShare && e.btnShare.addEventListener("click", ne), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
            o.images.length > 0 && Q();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", M), e.sortModal && e.sortModal.addEventListener("click", (t)=>{
            t.target === e.sortModal && M();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            M(), e.btnMerge && e.btnMerge.click();
        });
    }
    async function x(n) {
        if (console.log("Handling files:", n ? n.length : 0), !n || n.length === 0) return;
        (!e || !e.imageList) && (console.log("Lazy-initializing elements..."), U()), e.previewInfo && (e.previewInfo.textContent = "正在處理並修正圖片方向...");
        const t = [];
        for (const a of Array.from(n))if (a.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(a.name)) try {
            const l = await new Promise((d, f)=>{
                const g = new Image, b = URL.createObjectURL(a);
                g.onload = ()=>{
                    const s = document.createElement("canvas");
                    s.width = g.width, s.height = g.height, s.getContext("2d").drawImage(g, 0, 0, s.width, s.height), s.toBlob((c)=>{
                        const m = URL.createObjectURL(c), p = new Image;
                        p.onload = ()=>{
                            URL.revokeObjectURL(b), d({
                                img: p,
                                name: a.name,
                                width: p.width,
                                height: p.height,
                                src: m
                            });
                        }, p.src = m;
                    }, "image/png");
                }, g.onerror = ()=>{
                    URL.revokeObjectURL(b), f(new Error(`圖片讀取失敗: ${a.name}`));
                }, g.src = b;
            });
            t.push(l);
        } catch (l) {
            console.error(l);
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
        `, a.querySelector(".btn-remove").addEventListener("click", (i)=>{
                i.stopPropagation(), URL.revokeObjectURL(o.images[t].src), o.images.splice(t, 1), S(), e.downloadSection.style.display = "none";
            }), a.addEventListener("dragstart", T), a.addEventListener("dragover", W), a.addEventListener("drop", $), a.addEventListener("dragend", H), a.addEventListener("dragenter", A), a.addEventListener("dragleave", N), a.addEventListener("touchstart", O, {
                passive: !1
            }), a.addEventListener("touchmove", _, {
                passive: !1
            }), a.addEventListener("touchend", j, {
                passive: !1
            }), e.imageList.appendChild(a);
        }), e.btnMerge.disabled = o.images.length < 2, Y();
    }
    function Y() {
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
    function Q() {
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
        `, a.addEventListener("dragstart", T), a.addEventListener("dragover", W), a.addEventListener("drop", $), a.addEventListener("dragend", H), a.addEventListener("dragenter", A), a.addEventListener("dragleave", N), a.addEventListener("touchstart", O, {
                passive: !1
            }), a.addEventListener("touchmove", _, {
                passive: !1
            }), a.addEventListener("touchend", j, {
                passive: !1
            }), e.sortList.appendChild(a);
        });
    }
    let w = null;
    function T(n) {
        w = parseInt(this.dataset.index), this.classList.add("dragging"), n.dataTransfer.effectAllowed = "move", n.dataTransfer.setData("text/plain", w);
    }
    function W(n) {
        return n.preventDefault && n.preventDefault(), n.dataTransfer.dropEffect = "move", !1;
    }
    function A(n) {
        this.classList.add("drag-over");
    }
    function N(n) {
        this.classList.remove("drag-over");
    }
    function $(n) {
        n.stopPropagation && n.stopPropagation();
        const t = parseInt(this.dataset.index);
        if (w !== t) {
            const a = o.images.splice(w, 1)[0];
            o.images.splice(t, 0, a), S(), P(), e.downloadSection.style.display === "block" && E();
        }
        return !1;
    }
    function H(n) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("drag-over");
        });
    }
    let y = null;
    function O(n) {
        n.touches.length === 1 && (w = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function _(n) {
        if (n.touches.length !== 1 || w === null) return;
        n.preventDefault();
        const t = n.touches[0];
        this.style.pointerEvents = "none";
        const a = document.elementFromPoint(t.clientX, t.clientY);
        this.style.pointerEvents = "auto";
        const i = a?.closest(".image-item, .sort-item");
        y && y !== i && y.classList.remove("drag-over"), i && i.dataset.index !== void 0 && parseInt(i.dataset.index) !== w ? (i.classList.add("drag-over"), y = i) : y = null;
    }
    function j(n) {
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
    function E() {
        if (o.images.length < 1) return;
        const n = o.images;
        let t = 0, a = 0;
        const i = o.gridCols, l = n.length;
        let d = o.direction;
        if (i === 1 ? d = "vertical" : i === l && (d = "horizontal"), d === "horizontal") if (o.scaleMode === "fit-first") {
            const s = n[0].height;
            a = s, t = n.reduce((r, c)=>r + c.width * (s / c.height), 0);
        } else a = Math.max(...n.map((s)=>s.height)), t = n.reduce((s, r)=>s + r.width * (a / r.height), 0);
        else if (d === "vertical") if (o.scaleMode === "fit-first") {
            const s = n[0].width;
            t = s, a = n.reduce((r, c)=>r + c.height * (s / c.width), 0);
        } else t = Math.max(...n.map((s)=>s.width)), a = n.reduce((s, r)=>s + r.height * (t / r.width), 0);
        else {
            const s = Math.ceil(l / i);
            o.scaleMode === "fit-first" ? (t = n[0].width * i, a = n[0].height * s) : (t = Math.max(...n.map((r)=>r.width)) * i, a = Math.max(...n.map((r)=>r.height)) * s);
        }
        o.baseWidth = t, o.baseHeight = a;
        const f = o.outputScale / 100, g = t * f, b = a * f;
        if (e.canvas.width = g, e.canvas.height = b, e.canvas.style.width = g + "px", e.ctx.fillStyle = o.bgColor, e.ctx.fillRect(0, 0, g, b), e.ctx.save(), e.ctx.scale(f, f), d === "grid") {
            const s = Math.ceil(l / i), r = t / i, c = a / s;
            n.forEach((m, p)=>{
                const u = Math.floor(p / i), h = p % i, v = r, L = c;
                let D = h * r, z = u * c;
                e.ctx.drawImage(m.img, D, z, v, L);
            });
        } else {
            let s = 0;
            n.forEach((r)=>{
                let c, m, p, u;
                d === "horizontal" ? (m = a, c = r.width * (a / r.height), p = s, u = 0, s += c) : (c = t, m = r.height * (t / r.width), p = 0, u = s, s += m), e.ctx.drawImage(r.img, p, u, c, m);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(g)} x ${Math.round(b)} (${o.outputScale.toFixed(1)}%)`, I();
    }
    async function ee() {
        if (!(o.images.length < 1)) {
            e.previewInfo.textContent = "Rust 引擎正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const n = await Promise.all(o.images.map((h)=>fetch(h.src).then((v)=>v.arrayBuffer()))), t = new Uint8Array(n.reduce((h, v)=>h + v.byteLength, 0)), a = new Uint32Array(o.images.length * 2);
                let i = 0;
                n.forEach((h, v)=>{
                    const L = new Uint8Array(h);
                    t.set(L, i), a[v * 2] = i, a[v * 2 + 1] = i + L.length, i += L.length;
                });
                const l = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                };
                let d = l[o.direction];
                o.direction === "grid" && (o.gridCols === 1 ? d = l.vertical : o.gridCols === o.images.length && (d = l.horizontal));
                const f = parseInt(o.bgColor.slice(1, 3), 16), g = parseInt(o.bgColor.slice(3, 5), 16), b = parseInt(o.bgColor.slice(5, 7), 16), s = performance.now();
                let r;
                try {
                    if (!C) throw new Error("WASM_MISSING");
                    r = C(t, a, d, 1, o.gridCols, f, g, b);
                } catch (h) {
                    if (h.message === "WASM_MISSING" || h.toString().includes("WASM_MISSING")) {
                        console.info("使用 JS Fallback 引擎渲染..."), E();
                        const v = e.canvas.toDataURL("image/png"), L = await (await fetch(v)).blob(), D = URL.createObjectURL(L);
                        e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `JS 引擎處理完成！解析度: ${e.canvas.width}x${e.canvas.height}`, e.btnMerge.disabled = !1, I();
                        return;
                    }
                    throw h;
                }
                const c = performance.now();
                console.log(`Rust 拼接耗時: ${(c - s).toFixed(2)}ms`);
                const m = new Blob([
                    r
                ], {
                    type: "image/png"
                }), p = URL.createObjectURL(m), u = new Image;
                u.onload = ()=>{
                    o.baseWidth = u.width, o.baseHeight = u.height, e.canvas.width = u.width, e.canvas.height = u.height, e.ctx.drawImage(u, 0, 0), e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${u.width}x${u.height} (耗時 ${(c - s).toFixed(0)}ms)`, e.btnMerge.disabled = !1, I();
                }, u.src = p;
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
                const t = n.split(",")[1], a = `PicMerger_${Date.now()}.png`;
                await B.writeFile({
                    path: `PicMerger/${a}`,
                    data: t,
                    directory: k.Documents,
                    recursive: !0
                }), await G.show({
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
    async function ne() {
        try {
            e.btnShare.disabled = !0, e.btnShare.textContent = "正在準備分享...";
            const n = e.canvas.toDataURL("image/png", .9), t = `PicMerger_Share_${Date.now()}.png`;
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const a = n.split(",")[1], i = await B.writeFile({
                    path: t,
                    data: a,
                    directory: k.Cache
                });
                await q.share({
                    title: "分享合併圖片",
                    url: i.uri,
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
    function ae() {
        o.images.forEach((n)=>URL.revokeObjectURL(n.src)), o.images = [], S(), e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height), e.previewInfo.textContent = "請上傳圖片以開始", e.downloadSection.style.display = "none", e.fileInput.value = "";
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
