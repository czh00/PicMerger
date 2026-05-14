(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);
        new MutationObserver((r)=>{
            for (const s of r)if (s.type === "childList") for (const m of s.addedNodes)m.tagName === "LINK" && m.rel === "modulepreload" && i(m);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function a(r) {
            const s = {};
            return r.integrity && (s.integrity = r.integrity), r.referrerPolicy && (s.referrerPolicy = r.referrerPolicy), r.crossOrigin === "use-credentials" ? s.credentials = "include" : r.crossOrigin === "anonymous" ? s.credentials = "omit" : s.credentials = "same-origin", s;
        }
        function i(r) {
            if (r.ep) return;
            r.ep = !0;
            const s = a(r);
            fetch(r.href, s);
        }
    })();
    const Z = "modulepreload", q = function(n, t) {
        return new URL(n, t).href;
    }, B = {}, F = function(t, a, i) {
        let r = Promise.resolve();
        if (a && a.length > 0) {
            let m = function(c) {
                return Promise.all(c.map((d)=>Promise.resolve(d).then((l)=>({
                            status: "fulfilled",
                            value: l
                        }), (l)=>({
                            status: "rejected",
                            reason: l
                        }))));
            };
            const p = document.getElementsByTagName("link"), v = document.querySelector("meta[property=csp-nonce]"), b = v?.nonce || v?.getAttribute("nonce");
            r = m(a.map((c)=>{
                if (c = q(c, i), c in B) return;
                B[c] = !0;
                const d = c.endsWith(".css"), l = d ? '[rel="stylesheet"]' : "";
                if (!!i) for(let f = p.length - 1; f >= 0; f--){
                    const h = p[f];
                    if (h.href === c && (!d || h.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${c}"]${l}`)) return;
                const g = document.createElement("link");
                if (g.rel = d ? "stylesheet" : Z, d || (g.as = "script"), g.crossOrigin = "", g.href = c, b && g.setAttribute("nonce", b), document.head.appendChild(g), d) return new Promise((f, h)=>{
                    g.addEventListener("load", f), g.addEventListener("error", ()=>h(new Error(`Unable to preload CSS for ${c}`)));
                });
            }));
        }
        function s(m) {
            const p = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (p.payload = m, window.dispatchEvent(p), !p.defaultPrevented) throw m;
        }
        return r.then((m)=>{
            for (const p of m || [])p.status === "rejected" && s(p.reason);
            return t().catch(s);
        });
    };
    console.log("DEBUG: main.js loading...");
    window.handleFiles = R;
    let k, U, G, Y;
    async function J() {}
    let P = null;
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
        canShare: !!navigator.share,
        isMerged: !1
    };
    let e = {};
    function $() {
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
            t.preventDefault(), t.stopPropagation(), e.dropZone.classList.remove("drag-over"), console.log("Drop event triggered"), t.dataTransfer && t.dataTransfer.files && R(t.dataTransfer.files);
        }), e.fileInput.addEventListener("change", (t)=>{
            R(t.target.files);
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
            if (o.images.length < 1) return;
            if (o.images.some((a)=>a.isVideo)) {
                e.btnMerge.disabled = !0;
                const a = e.btnMerge.textContent;
                e.btnMerge.textContent = "🎬 正在生成影片...", setTimeout(async ()=>{
                    try {
                        await te(), await x();
                    } catch (i) {
                        console.error("Video error:", i), alert("影片處理失敗: " + (i.message || i));
                    } finally{
                        e.btnMerge.disabled = !1, e.btnMerge.textContent = a;
                    }
                }, 50);
            } else try {
                await x();
            } catch (a) {
                console.error("Save error:", a), alert("儲存失敗: " + (a.message || a));
            }
        }), e.btnReset && e.btnReset.addEventListener("click", ae), e.btnSave && e.btnSave.addEventListener("click", x), e.btnShare && e.btnShare.addEventListener("click", ne), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
            o.images.length > 0 && Q();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", M), e.sortModal && e.sortModal.addEventListener("click", (t)=>{
            t.target === e.sortModal && M();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            M(), L();
        });
    }
    async function R(n) {
        if (console.log("Handling files:", n ? n.length : 0), !n || n.length === 0) return;
        (!e || !e.imageList) && (console.log("Lazy-initializing elements..."), $()), e.previewInfo && (e.previewInfo.textContent = "正在處理並修正圖片方向...");
        const t = [];
        for (const a of Array.from(n)){
            const i = a.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(a.name), r = a.type.startsWith("video/") || /\.(mp4|webm|mov|avi)$/i.test(a.name);
            if (!(!i && !r)) try {
                if (r) {
                    t.push({
                        img: new Image,
                        name: a.name,
                        width: 1920,
                        height: 1080,
                        src: "placeholder_video",
                        isVideo: !0,
                        file: a
                    });
                    continue;
                }
                const s = await new Promise((m, p)=>{
                    const v = new Image, b = URL.createObjectURL(a);
                    v.onload = ()=>{
                        const c = document.createElement("canvas");
                        c.width = v.width, c.height = v.height, c.getContext("2d").drawImage(v, 0, 0, c.width, c.height), c.toBlob((l)=>{
                            const u = URL.createObjectURL(l), g = new Image;
                            g.onload = ()=>{
                                URL.revokeObjectURL(b), m({
                                    img: g,
                                    name: a.name,
                                    width: g.width,
                                    height: g.height,
                                    src: u,
                                    isVideo: !1
                                });
                            }, g.src = u;
                        }, "image/png");
                    }, v.onerror = ()=>{
                        URL.revokeObjectURL(b), p(new Error(`檔案讀取失敗: ${a.name}`));
                    }, v.src = b;
                });
                t.push(s);
            } catch (s) {
                console.error(s);
            }
        }
        t.length > 0 && (o.images = [
            ...o.images,
            ...t
        ], I(), e.previewInfo.textContent = `已載入 ${o.images.length} 張圖片。`, e.downloadSection.style.display = "none", setTimeout(()=>{
            console.log("Auto-triggering preview..."), L();
        }, 100));
    }
    function I() {
        e.fileCount.textContent = o.images.length, e.imageList.innerHTML = "", o.images.forEach((t, a)=>{
            const i = document.createElement("div");
            i.className = "image-item", i.draggable = !0, i.dataset.index = a, i.innerHTML = `
            <img src="${t.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `, i.querySelector(".btn-remove").addEventListener("click", (r)=>{
                r.stopPropagation(), URL.revokeObjectURL(o.images[a].src), o.images.splice(a, 1), I(), e.downloadSection.style.display = "none";
            }), i.addEventListener("dragstart", W), i.addEventListener("dragover", H), i.addEventListener("drop", V), i.addEventListener("dragend", O), i.addEventListener("dragenter", A), i.addEventListener("dragleave", N), i.addEventListener("touchstart", _, {
                passive: !1
            }), i.addEventListener("touchmove", j, {
                passive: !1
            }), i.addEventListener("touchend", z, {
                passive: !1
            }), e.imageList.appendChild(i);
        }), e.btnMerge.disabled = o.images.length < 1;
        const n = o.images.some((t)=>t.isVideo);
        e.btnMerge.textContent = n ? "🎬 生成合併影片" : "💾 儲存合併圖", K();
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
        const a = o.outputScale / 100, i = Math.round(o.baseWidth * a), r = Math.round(o.baseHeight * a);
        o.outputMode === "scale" ? (e.outputValueInput.max = 100, t = Math.round(o.outputScale), n && (n.innerHTML = `${t}% <small>(${i} x ${r})</small>`)) : o.outputMode === "width" ? (e.outputValueInput.max = o.baseWidth * 2, t = i, n && (n.innerHTML = `${t}px <small>(高: ${r}px)</small>`)) : o.outputMode === "height" && (e.outputValueInput.max = o.baseHeight * 2, t = r, n && (n.innerHTML = `${t}px <small>(寬: ${i}px)</small>`)), e.outputValueInput.value = t;
    }
    function Q() {
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
        `, a.addEventListener("dragstart", W), a.addEventListener("dragover", H), a.addEventListener("drop", V), a.addEventListener("dragend", O), a.addEventListener("dragenter", A), a.addEventListener("dragleave", N), a.addEventListener("touchstart", _, {
                passive: !1
            }), a.addEventListener("touchmove", j, {
                passive: !1
            }), a.addEventListener("touchend", z, {
                passive: !1
            }), e.sortList.appendChild(a);
        });
    }
    let y = null;
    function W(n) {
        y = parseInt(this.dataset.index), this.classList.add("dragging"), n.dataTransfer.effectAllowed = "move", n.dataTransfer.setData("text/plain", y);
    }
    function H(n) {
        return n.preventDefault && n.preventDefault(), n.dataTransfer.dropEffect = "move", !1;
    }
    function A(n) {
        this.classList.add("drag-over");
    }
    function N(n) {
        this.classList.remove("drag-over");
    }
    function V(n) {
        n.stopPropagation && n.stopPropagation();
        const t = parseInt(this.dataset.index);
        if (y !== t) {
            const a = o.images.splice(y, 1)[0];
            o.images.splice(t, 0, a), I(), D(), e.downloadSection.style.display === "block" && L();
        }
        return !1;
    }
    function O(n) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("drag-over");
        });
    }
    let E = null;
    function _(n) {
        n.touches.length === 1 && (y = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function j(n) {
        if (n.touches.length !== 1 || y === null) return;
        n.preventDefault();
        const t = n.touches[0];
        this.style.pointerEvents = "none";
        const a = document.elementFromPoint(t.clientX, t.clientY);
        this.style.pointerEvents = "auto";
        const i = a?.closest(".image-item, .sort-item");
        E && E !== i && E.classList.remove("drag-over"), i && i.dataset.index !== void 0 && parseInt(i.dataset.index) !== y ? (i.classList.add("drag-over"), E = i) : E = null;
    }
    function z(n) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", E) {
            const t = parseInt(E.dataset.index);
            if (E.classList.remove("drag-over"), y !== null && !isNaN(t) && y !== t) {
                const a = o.images.splice(y, 1)[0];
                o.images.splice(t, 0, a), I(), D(), e.downloadSection.style.display === "block" && L();
            }
        }
        E = null, y = null, document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("dragging", "drag-over"), t.style.pointerEvents = "auto";
        });
    }
    function T(n, t, a, i, r, s) {
        const m = t.width / t.height, p = r / s;
        let v, b, c, d;
        m > p ? (v = r, b = r / m, c = a, d = i + (s - b) / 2) : (b = s, v = s * m, c = a + (r - v) / 2, d = i), n.drawImage(t, 0, 0, t.width, t.height, c, d, v, b);
    }
    function L() {
        if (o.images.length < 1) return;
        const n = o.images;
        let t = 0, a = 0;
        const i = o.gridCols, r = n.length;
        let s = o.direction;
        i === 1 ? s = "vertical" : i === r && (s = "horizontal");
        const m = [];
        let p = 0;
        if (s === "horizontal") {
            const d = o.scaleMode === "fit-first" ? n[0].height : Math.max(...n.map((l)=>l.height));
            a = d, t = n.reduce((l, u)=>l + u.width * (d / u.height), 0);
        } else if (s === "vertical") {
            const d = o.scaleMode === "fit-first" ? n[0].width : Math.max(...n.map((l)=>l.width));
            t = d, a = n.reduce((l, u)=>l + u.height * (d / u.width), 0);
        } else {
            p = o.scaleMode === "fit-first" ? n[0].width : Math.max(...n.map((l)=>l.width)), t = p * i;
            const d = Math.ceil(r / i);
            for(let l = 0; l < d; l++){
                let u = 0;
                for(let g = 0; g < i; g++){
                    const f = l * i + g;
                    if (f < r) {
                        const h = n[f], w = h.height * (p / h.width);
                        w > u && (u = w);
                    }
                }
                m.push(u);
            }
            a = m.reduce((l, u)=>l + u, 0);
        }
        o.baseWidth = t, o.baseHeight = a;
        const v = o.outputScale / 100, b = t * v, c = a * v;
        if (e.canvas.width = b, e.canvas.height = c, e.canvas.style.width = b + "px", e.ctx.fillStyle = o.bgColor, e.ctx.fillRect(0, 0, b, c), e.ctx.save(), e.ctx.scale(v, v), s === "grid") {
            let d = 0;
            const l = Math.ceil(r / i);
            for(let u = 0; u < l; u++){
                const g = m[u];
                for(let f = 0; f < i; f++){
                    const h = u * i + f;
                    h < r && T(e.ctx, n[h].img, f * p, d, p, g);
                }
                d += g;
            }
        } else {
            let d = 0;
            n.forEach((l)=>{
                let u, g, f, h;
                s === "horizontal" ? (g = a, u = l.width * (a / l.height), f = d, h = 0, d += u) : (u = t, g = l.height * (t / l.width), f = 0, h = d, d += g), T(e.ctx, l.img, f, h, u, g);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(b)} x ${Math.round(c)}`, C();
    }
    async function ee() {
        console.log("PicMerger v1.0.18 Initializing..."), J(), $(), e.btnShare && (window.Capacitor && window.Capacitor.isNativePlatform() && o.canShare ? (e.btnShare.style.setProperty("display", "block", "important"), e.btnShare.disabled = !1) : e.btnShare.style.setProperty("display", "none", "important")), X(), console.log("Event listeners attached.");
        try {
            const { default: n, merge_images: t } = await F(async ()=>{
                const { default: a, merge_images: i } = await import("./pic_wasm-C60cSF7V.js");
                return {
                    default: a,
                    merge_images: i
                };
            }, [], import.meta.url);
            await n(), P = t, console.log("WASM engine loaded successfully.");
        } catch (n) {
            console.warn("WASM 載入跳過 (採用 JS 降級引擎):", n);
        }
    }
    async function te() {
        if (!(o.images.length < 1)) {
            e.previewInfo.textContent = "正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const n = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                };
                let t = n[o.direction], a = !1;
                if (o.direction === "grid" && (o.gridCols === 1 ? t = n.vertical : o.gridCols === o.images.length ? t = n.horizontal : a = !0), a || !P) {
                    console.info("使用 JS 高品質引擎渲染 (Contain)..."), L();
                    const h = e.canvas.toDataURL("image/png"), w = await (await fetch(h)).blob(), S = URL.createObjectURL(w);
                    e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `處理完成！解析度: ${e.canvas.width}x${e.canvas.height} (完整顯示)`, e.btnMerge.disabled = !1, C();
                    return;
                }
                const i = await Promise.all(o.images.map((h)=>fetch(h.src).then((w)=>w.arrayBuffer()))), r = new Uint8Array(i.reduce((h, w)=>h + w.byteLength, 0)), s = new Uint32Array(o.images.length * 2);
                let m = 0;
                i.forEach((h, w)=>{
                    const S = new Uint8Array(h);
                    r.set(S, m), s[w * 2] = m, s[w * 2 + 1] = m + S.length, m += S.length;
                });
                const p = parseInt(o.bgColor.slice(1, 3), 16), v = parseInt(o.bgColor.slice(3, 5), 16), b = parseInt(o.bgColor.slice(5, 7), 16), c = performance.now(), d = P(r, s, t, 1, o.gridCols, p, v, b), l = performance.now(), u = new Blob([
                    d
                ], {
                    type: "image/png"
                }), g = URL.createObjectURL(u), f = new Image;
                f.onload = ()=>{
                    o.baseWidth = f.width, o.baseHeight = f.height, e.canvas.width = f.width, e.canvas.height = f.height, e.ctx.drawImage(f, 0, 0), e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${f.width}x${f.height} (耗時 ${(l - c).toFixed(0)}ms)`, e.btnMerge.disabled = !1, C();
                }, f.src = g;
            } catch (n) {
                console.error("Rust 處理失敗:", n), e.previewInfo.textContent = "Rust 引擎發生錯誤: " + n, e.btnMerge.disabled = !1;
            }
        }
    }
    async function x() {
        try {
            e.btnSave.disabled = !0, e.btnSave.textContent = "正在儲存至外部儲存...";
            const n = e.canvas.toDataURL("image/png", .9);
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const t = n.split(",")[1], a = `PicMerger_${Date.now()}.png`;
                await k.writeFile({
                    path: `PicMerger/${a}`,
                    data: t,
                    directory: U.Documents,
                    recursive: !0
                }), await Y.show({
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
                const a = n.split(",")[1], i = await k.writeFile({
                    path: t,
                    data: a,
                    directory: U.Cache
                });
                await G.share({
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
    ee();
})();
