(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);
        new MutationObserver((s)=>{
            for (const d of s)if (d.type === "childList") for (const g of d.addedNodes)g.tagName === "LINK" && g.rel === "modulepreload" && i(g);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function a(s) {
            const d = {};
            return s.integrity && (d.integrity = s.integrity), s.referrerPolicy && (d.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? d.credentials = "include" : s.crossOrigin === "anonymous" ? d.credentials = "omit" : d.credentials = "same-origin", d;
        }
        function i(s) {
            if (s.ep) return;
            s.ep = !0;
            const d = a(s);
            fetch(s.href, d);
        }
    })();
    const z = "modulepreload", V = function(n, t) {
        return new URL(n, t).href;
    }, R = {}, Z = function(t, a, i) {
        let s = Promise.resolve();
        if (a && a.length > 0) {
            let g = function(r) {
                return Promise.all(r.map((c)=>Promise.resolve(c).then((f)=>({
                            status: "fulfilled",
                            value: f
                        }), (f)=>({
                            status: "rejected",
                            reason: f
                        }))));
            };
            const u = document.getElementsByTagName("link"), h = document.querySelector("meta[property=csp-nonce]"), l = h?.nonce || h?.getAttribute("nonce");
            s = g(a.map((r)=>{
                if (r = V(r, i), r in R) return;
                R[r] = !0;
                const c = r.endsWith(".css"), f = c ? '[rel="stylesheet"]' : "";
                if (!!i) for(let m = u.length - 1; m >= 0; m--){
                    const b = u[m];
                    if (b.href === r && (!c || b.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${r}"]${f}`)) return;
                const p = document.createElement("link");
                if (p.rel = c ? "stylesheet" : z, c || (p.as = "script"), p.crossOrigin = "", p.href = r, l && p.setAttribute("nonce", l), document.head.appendChild(p), c) return new Promise((m, b)=>{
                    p.addEventListener("load", m), p.addEventListener("error", ()=>b(new Error(`Unable to preload CSS for ${r}`)));
                });
            }));
        }
        function d(g) {
            const u = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (u.payload = g, window.dispatchEvent(u), !u.defaultPrevented) throw g;
        }
        return s.then((g)=>{
            for (const u of g || [])u.status === "rejected" && d(u.reason);
            return t().catch(d);
        });
    };
    console.log("DEBUG: main.js loading...");
    window.handleFiles = P;
    let B, T, q, F;
    async function G() {}
    let x = null;
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
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.remove("drag-over"), console.log("Drop event triggered"), t.dataTransfer && t.dataTransfer.files && P(t.dataTransfer.files);
        }), e.fileInput.addEventListener("change", (t)=>{
            P(t.target.files);
        })) : console.error("Drop zone or file input not found!"), e.gridColsInput && e.gridColsInput.addEventListener("input", (t)=>{
            o.gridCols = parseInt(t.target.value) || 1;
            const a = document.getElementById("grid-cols-value");
            a && (a.textContent = o.gridCols), L();
        });
        const n = document.getElementById("output-mode-group");
        n && n.querySelectorAll("button").forEach((t)=>{
            t.addEventListener("click", ()=>{
                o.outputMode = t.dataset.value, o.outputScale = 100, n.querySelectorAll("button").forEach((a)=>a.classList.remove("active")), t.classList.add("active"), C(), L();
            });
        }), e.outputValueInput && e.outputValueInput.addEventListener("input", (t)=>{
            const a = parseFloat(t.target.value);
            if (!a) return;
            o.outputMode === "scale" ? o.outputScale = a : o.outputMode === "width" && o.baseWidth ? o.outputScale = a / o.baseWidth * 100 : o.outputMode === "height" && o.baseHeight && (o.outputScale = a / o.baseHeight * 100);
            const i = document.getElementById("output-value-label");
            i && (i.textContent = Math.round(a) + (o.outputMode === "scale" ? "%" : "px")), L();
        }), e.scaleModeSelect && e.scaleModeSelect.addEventListener("change", (t)=>{
            o.scaleMode = t.target.value, L();
        }), e.bgColorInput && e.bgColorInput.addEventListener("change", (t)=>{
            o.bgColor = t.target.value, L();
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
            o.images.length > 0 && X();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", M), e.sortModal && e.sortModal.addEventListener("click", (t)=>{
            t.target === e.sortModal && M();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            M(), e.btnMerge && e.btnMerge.click();
        });
    }
    async function P(n) {
        if (console.log("Handling files:", n ? n.length : 0), !n || n.length === 0) return;
        (!e || !e.imageList) && (console.log("Lazy-initializing elements..."), k()), e.previewInfo && (e.previewInfo.textContent = "正在處理並修正圖片方向...");
        const t = [];
        for (const a of Array.from(n))if (a.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(a.name)) try {
            const s = await new Promise((d, g)=>{
                const u = new Image, h = URL.createObjectURL(a);
                u.onload = ()=>{
                    const l = document.createElement("canvas");
                    l.width = u.width, l.height = u.height, l.getContext("2d").drawImage(u, 0, 0, l.width, l.height), l.toBlob((c)=>{
                        const f = URL.createObjectURL(c), v = new Image;
                        v.onload = ()=>{
                            URL.revokeObjectURL(h), d({
                                img: v,
                                name: a.name,
                                width: v.width,
                                height: v.height,
                                src: f
                            });
                        }, v.src = f;
                    }, "image/png");
                }, u.onerror = ()=>{
                    URL.revokeObjectURL(h), g(new Error(`圖片讀取失敗: ${a.name}`));
                }, u.src = h;
            });
            t.push(s);
        } catch (s) {
            console.error(s);
        }
        t.length > 0 && (o.images = [
            ...o.images,
            ...t
        ], I(), e.previewInfo.textContent = `已載入 ${o.images.length} 張圖片。`, e.downloadSection.style.display = "none", setTimeout(()=>{
            console.log("Auto-triggering preview..."), L();
        }, 100));
    }
    function I() {
        e.fileCount.textContent = o.images.length, e.imageList.innerHTML = "", o.images.forEach((n, t)=>{
            const a = document.createElement("div");
            a.className = "image-item", a.draggable = !0, a.dataset.index = t, a.innerHTML = `
            <img src="${n.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `, a.querySelector(".btn-remove").addEventListener("click", (i)=>{
                i.stopPropagation(), URL.revokeObjectURL(o.images[t].src), o.images.splice(t, 1), I(), e.downloadSection.style.display = "none";
            }), a.addEventListener("dragstart", U), a.addEventListener("dragover", $), a.addEventListener("drop", H), a.addEventListener("dragend", N), a.addEventListener("dragenter", W), a.addEventListener("dragleave", A), a.addEventListener("touchstart", O, {
                passive: !1
            }), a.addEventListener("touchmove", j, {
                passive: !1
            }), a.addEventListener("touchend", _, {
                passive: !1
            }), e.imageList.appendChild(a);
        }), e.btnMerge.disabled = o.images.length < 2, K();
    }
    function K() {
        if (e.gridColsInput) {
            const n = o.images.length || 1;
            e.gridColsInput.max = n, o.gridCols > n && (o.gridCols = n), e.gridColsInput.value = o.gridCols;
            const t = document.getElementById("grid-cols-value");
            t && (t.textContent = o.gridCols);
        }
    }
    function C() {
        if (!o.baseWidth || !o.baseHeight) return;
        const n = document.getElementById("output-value-label");
        let t = 100;
        const a = o.outputScale / 100, i = Math.round(o.baseWidth * a), s = Math.round(o.baseHeight * a);
        o.outputMode === "scale" ? (e.outputValueInput.max = 100, t = Math.round(o.outputScale), n && (n.innerHTML = `${t}% <small>(${i} x ${s})</small>`)) : o.outputMode === "width" ? (e.outputValueInput.max = o.baseWidth * 2, t = i, n && (n.innerHTML = `${t}px <small>(高: ${s}px)</small>`)) : o.outputMode === "height" && (e.outputValueInput.max = o.baseHeight * 2, t = s, n && (n.innerHTML = `${t}px <small>(寬: ${i}px)</small>`)), e.outputValueInput.value = t;
    }
    function X() {
        D(), e.sortModal.classList.add("show"), document.body.style.overflow = "hidden";
    }
    function M() {
        e.sortModal.classList.remove("show"), document.body.style.overflow = "";
    }
    function D() {
        e.sortList.innerHTML = "", o.images.forEach((n, t)=>{
            const a = document.createElement("div");
            a.className = "sort-item", a.draggable = !0, a.dataset.index = t, a.innerHTML = `
            <img src="${n.src}" alt="Thumb" />
            <div class="info">${n.name}</div>
        `, a.addEventListener("dragstart", U), a.addEventListener("dragover", $), a.addEventListener("drop", H), a.addEventListener("dragend", N), a.addEventListener("dragenter", W), a.addEventListener("dragleave", A), a.addEventListener("touchstart", O, {
                passive: !1
            }), a.addEventListener("touchmove", j, {
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
    function $(n) {
        return n.preventDefault && n.preventDefault(), n.dataTransfer.dropEffect = "move", !1;
    }
    function W(n) {
        this.classList.add("drag-over");
    }
    function A(n) {
        this.classList.remove("drag-over");
    }
    function H(n) {
        n.stopPropagation && n.stopPropagation();
        const t = parseInt(this.dataset.index);
        if (w !== t) {
            const a = o.images.splice(w, 1)[0];
            o.images.splice(t, 0, a), I(), D(), e.downloadSection.style.display === "block" && L();
        }
        return !1;
    }
    function N(n) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("drag-over");
        });
    }
    let y = null;
    function O(n) {
        n.touches.length === 1 && (w = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function j(n) {
        if (n.touches.length !== 1 || w === null) return;
        n.preventDefault();
        const t = n.touches[0];
        this.style.pointerEvents = "none";
        const a = document.elementFromPoint(t.clientX, t.clientY);
        this.style.pointerEvents = "auto";
        const i = a?.closest(".image-item, .sort-item");
        y && y !== i && y.classList.remove("drag-over"), i && i.dataset.index !== void 0 && parseInt(i.dataset.index) !== w ? (i.classList.add("drag-over"), y = i) : y = null;
    }
    function _(n) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", y) {
            const t = parseInt(y.dataset.index);
            if (y.classList.remove("drag-over"), w !== null && !isNaN(t) && w !== t) {
                const a = o.images.splice(w, 1)[0];
                o.images.splice(t, 0, a), I(), D(), e.downloadSection.style.display === "block" && L();
            }
        }
        y = null, w = null, document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("dragging", "drag-over"), t.style.pointerEvents = "auto";
        });
    }
    function Y(n, t, a, i, s, d) {
        const g = t.width / t.height, u = s / d;
        let h, l, r, c;
        g > u ? (c = t.height, r = c * u, h = (t.width - r) / 2, l = 0) : (r = t.width, c = r / u, h = 0, l = (t.height - c) / 2), n.drawImage(t, h, l, r, c, a, i, s, d);
    }
    function L() {
        if (o.images.length < 1) return;
        const n = o.images;
        let t = 0, a = 0;
        const i = o.gridCols, s = n.length;
        let d = o.direction;
        if (i === 1 ? d = "vertical" : i === s && (d = "horizontal"), d === "horizontal") {
            const l = o.scaleMode === "fit-first" ? n[0].height : Math.max(...n.map((r)=>r.height));
            a = l, t = n.reduce((r, c)=>r + c.width * (l / c.height), 0);
        } else if (d === "vertical") {
            const l = o.scaleMode === "fit-first" ? n[0].width : Math.max(...n.map((r)=>r.width));
            t = l, a = n.reduce((r, c)=>r + c.height * (l / c.width), 0);
        } else {
            const l = Math.ceil(s / i);
            o.scaleMode === "fit-first" ? (t = n[0].width * i, a = n[0].height * l) : (t = Math.max(...n.map((r)=>r.width)) * i, a = Math.max(...n.map((r)=>r.height)) * l);
        }
        o.baseWidth = t, o.baseHeight = a;
        const g = o.outputScale / 100, u = t * g, h = a * g;
        if (e.canvas.width = u, e.canvas.height = h, e.canvas.style.width = u + "px", e.ctx.fillStyle = o.bgColor, e.ctx.fillRect(0, 0, u, h), e.ctx.save(), e.ctx.scale(g, g), d === "grid") {
            const l = Math.ceil(s / i), r = t / i, c = a / l;
            n.forEach((f, v)=>{
                const p = Math.floor(v / i), m = v % i;
                Y(e.ctx, f.img, m * r, p * c, r, c);
            });
        } else {
            let l = 0;
            n.forEach((r)=>{
                let c, f, v, p;
                d === "horizontal" ? (f = a, c = r.width * (a / r.height), v = l, p = 0, l += c) : (c = t, f = r.height * (t / r.width), v = 0, p = l, l += f), e.ctx.drawImage(r.img, v, p, c, f);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(u)} x ${Math.round(h)}`, C();
    }
    async function Q() {
        console.log("PicMerger v1.0.12 Initializing..."), G(), k(), e.btnShare && (window.Capacitor && window.Capacitor.isNativePlatform() && o.canShare ? (e.btnShare.style.setProperty("display", "block", "important"), e.btnShare.disabled = !1) : e.btnShare.style.setProperty("display", "none", "important")), J(), console.log("Event listeners attached.");
        try {
            const { default: n, merge_images: t } = await Z(async ()=>{
                const { default: a, merge_images: i } = await import("./pic_wasm-C60cSF7V.js");
                return {
                    default: a,
                    merge_images: i
                };
            }, [], import.meta.url);
            await n(), x = t, console.log("WASM engine loaded successfully.");
        } catch (n) {
            console.warn("WASM 載入跳過 (採用 JS 降級引擎):", n);
        }
    }
    async function ee() {
        if (!(o.images.length < 1)) {
            e.previewInfo.textContent = "正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const n = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                };
                let t = n[o.direction], a = !1;
                if (o.direction === "grid" && (o.gridCols === 1 ? t = n.vertical : o.gridCols === o.images.length ? t = n.horizontal : a = !0), a || !x) {
                    console.info("使用 JS 引擎渲染以保證比例鎖定..."), L();
                    const b = e.canvas.toDataURL("image/png"), E = await (await fetch(b)).blob(), S = URL.createObjectURL(E);
                    e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `處理完成！解析度: ${e.canvas.width}x${e.canvas.height} (比例鎖定)`, e.btnMerge.disabled = !1, C();
                    return;
                }
                const i = await Promise.all(o.images.map((b)=>fetch(b.src).then((E)=>E.arrayBuffer()))), s = new Uint8Array(i.reduce((b, E)=>b + E.byteLength, 0)), d = new Uint32Array(o.images.length * 2);
                let g = 0;
                i.forEach((b, E)=>{
                    const S = new Uint8Array(b);
                    s.set(S, g), d[E * 2] = g, d[E * 2 + 1] = g + S.length, g += S.length;
                });
                const u = parseInt(o.bgColor.slice(1, 3), 16), h = parseInt(o.bgColor.slice(3, 5), 16), l = parseInt(o.bgColor.slice(5, 7), 16), r = performance.now(), c = x(s, d, t, 1, o.gridCols, u, h, l), f = performance.now(), v = new Blob([
                    c
                ], {
                    type: "image/png"
                }), p = URL.createObjectURL(v), m = new Image;
                m.onload = ()=>{
                    o.baseWidth = m.width, o.baseHeight = m.height, e.canvas.width = m.width, e.canvas.height = m.height, e.ctx.drawImage(m, 0, 0), e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${m.width}x${m.height} (耗時 ${(f - r).toFixed(0)}ms)`, e.btnMerge.disabled = !1, C();
                }, m.src = p;
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
                    directory: T.Documents,
                    recursive: !0
                }), await F.show({
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
                    directory: T.Cache
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
        o.images.forEach((n)=>URL.revokeObjectURL(n.src)), o.images = [], I(), e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height), e.previewInfo.textContent = "請上傳圖片以開始", e.downloadSection.style.display = "none", e.fileInput.value = "";
    }
    window.addEventListener("dragover", (n)=>n.preventDefault(), !1);
    window.addEventListener("drop", (n)=>n.preventDefault(), !1);
    "serviceWorker" in navigator && window.addEventListener("load", ()=>{
        try {
            navigator.serviceWorker.register("sw.js").catch((n)=>console.warn("SW register failed (ignored)"));
        } catch  {}
    });
    Q();
})();
