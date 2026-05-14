(async ()=>{
    (function() {
        const n = document.createElement("link").relList;
        if (n && n.supports && n.supports("modulepreload")) return;
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
    const q = "modulepreload", Z = function(t, n) {
        return new URL(t, n).href;
    }, B = {}, F = function(n, a, i) {
        let r = Promise.resolve();
        if (a && a.length > 0) {
            let m = function(d) {
                return Promise.all(d.map((c)=>Promise.resolve(c).then((l)=>({
                            status: "fulfilled",
                            value: l
                        }), (l)=>({
                            status: "rejected",
                            reason: l
                        }))));
            };
            const h = document.getElementsByTagName("link"), v = document.querySelector("meta[property=csp-nonce]"), b = v?.nonce || v?.getAttribute("nonce");
            r = m(a.map((d)=>{
                if (d = Z(d, i), d in B) return;
                B[d] = !0;
                const c = d.endsWith(".css"), l = c ? '[rel="stylesheet"]' : "";
                if (!!i) for(let f = h.length - 1; f >= 0; f--){
                    const p = h[f];
                    if (p.href === d && (!c || p.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${d}"]${l}`)) return;
                const u = document.createElement("link");
                if (u.rel = c ? "stylesheet" : q, c || (u.as = "script"), u.crossOrigin = "", u.href = d, b && u.setAttribute("nonce", b), document.head.appendChild(u), c) return new Promise((f, p)=>{
                    u.addEventListener("load", f), u.addEventListener("error", ()=>p(new Error(`Unable to preload CSS for ${d}`)));
                });
            }));
        }
        function s(m) {
            const h = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (h.payload = m, window.dispatchEvent(h), !h.defaultPrevented) throw m;
        }
        return r.then((m)=>{
            for (const h of m || [])h.status === "rejected" && s(h.reason);
            return n().catch(s);
        });
    };
    window.handleFiles = P;
    let k, U, G, Y;
    async function J() {}
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
        }, console.log("Elements initialized:", Object.keys(e).filter((t)=>e[t]));
    }
    function X() {
        document.addEventListener("click", (n)=>{
            if (e.fileInput && n.target === e.fileInput) return;
            n.target.closest("#main-drop-zone") && e.fileInput && (console.log("Global Click Delegate Triggered"), e.fileInput.click());
        }), e.dropZone && e.fileInput ? (e.dropZone.addEventListener("click", (n)=>{
            n.target !== e.fileInput && (n.stopPropagation(), e.fileInput.click());
        }), e.dropZone.addEventListener("dragover", (n)=>{
            n.preventDefault(), n.stopPropagation(), e.dropZone.classList.add("drag-over");
        }), e.dropZone.addEventListener("dragleave", (n)=>{
            n.preventDefault(), n.stopPropagation(), e.dropZone.classList.remove("drag-over");
        }), e.dropZone.addEventListener("drop", (n)=>{
            n.preventDefault(), n.stopPropagation(), e.dropZone.classList.remove("drag-over"), console.log("Drop event triggered"), n.dataTransfer && n.dataTransfer.files && P(n.dataTransfer.files);
        }), e.fileInput.addEventListener("change", (n)=>{
            P(n.target.files);
        })) : console.error("Drop zone or file input not found!"), e.gridColsInput && e.gridColsInput.addEventListener("input", (n)=>{
            o.gridCols = parseInt(n.target.value) || 1;
            const a = document.getElementById("grid-cols-value");
            a && (a.textContent = o.gridCols), L();
        });
        const t = document.getElementById("output-mode-group");
        t && t.querySelectorAll("button").forEach((n)=>{
            n.addEventListener("click", ()=>{
                o.outputMode = n.dataset.value, o.outputScale = 100, t.querySelectorAll("button").forEach((a)=>a.classList.remove("active")), n.classList.add("active"), I(), L();
            });
        }), e.outputValueInput && e.outputValueInput.addEventListener("input", (n)=>{
            const a = parseFloat(n.target.value);
            if (!a) return;
            o.outputMode === "scale" ? o.outputScale = a : o.outputMode === "width" && o.baseWidth ? o.outputScale = a / o.baseWidth * 100 : o.outputMode === "height" && o.baseHeight && (o.outputScale = a / o.baseHeight * 100);
            const i = document.getElementById("output-value-label");
            i && (i.textContent = Math.round(a) + (o.outputMode === "scale" ? "%" : "px")), L();
        }), e.scaleModeSelect && e.scaleModeSelect.addEventListener("change", (n)=>{
            o.scaleMode = n.target.value, L();
        }), e.bgColorInput && e.bgColorInput.addEventListener("change", (n)=>{
            o.bgColor = n.target.value, L();
        }), e.btnMerge && e.btnMerge.addEventListener("click", async ()=>{
            if (o.images.length < 1) return;
            if (o.images.some((a)=>a.isVideo)) {
                e.btnMerge.disabled = !0;
                const a = e.btnMerge.textContent;
                e.btnMerge.textContent = "🎬 正在生成影片...", setTimeout(async ()=>{
                    try {
                        await te(), await T();
                    } catch (i) {
                        console.error("Video error:", i), alert("影片處理失敗: " + (i.message || i));
                    } finally{
                        e.btnMerge.disabled = !1, e.btnMerge.textContent = a;
                    }
                }, 50);
            } else try {
                await T();
            } catch (a) {
                console.error("Save error:", a), alert("儲存失敗: " + (a.message || a));
            }
        }), e.btnReset && e.btnReset.addEventListener("click", ae), e.btnShare && e.btnShare.addEventListener("click", ne), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
            o.images.length > 0 && Q();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", M), e.sortModal && e.sortModal.addEventListener("click", (n)=>{
            n.target === e.sortModal && M();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            M(), L();
        });
    }
    async function P(t) {
        if (console.log("Handling files:", t ? t.length : 0), !t || t.length === 0) return;
        (!e || !e.imageList) && (console.log("Lazy-initializing elements..."), $()), e.previewInfo && (e.previewInfo.textContent = "正在處理並修正圖片方向...");
        const n = [];
        for (const a of Array.from(t)){
            const i = a.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(a.name), r = a.type.startsWith("video/") || /\.(mp4|webm|mov|avi)$/i.test(a.name);
            if (!(!i && !r)) try {
                if (r) {
                    n.push({
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
                const s = await new Promise((m, h)=>{
                    const v = new Image, b = URL.createObjectURL(a);
                    v.onload = ()=>{
                        const d = document.createElement("canvas");
                        d.width = v.width, d.height = v.height, d.getContext("2d").drawImage(v, 0, 0, d.width, d.height), d.toBlob((l)=>{
                            const g = URL.createObjectURL(l), u = new Image;
                            u.onload = ()=>{
                                URL.revokeObjectURL(b), m({
                                    img: u,
                                    name: a.name,
                                    width: u.width,
                                    height: u.height,
                                    src: g,
                                    isVideo: !1
                                });
                            }, u.src = g;
                        }, "image/png");
                    }, v.onerror = ()=>{
                        URL.revokeObjectURL(b), h(new Error(`檔案讀取失敗: ${a.name}`));
                    }, v.src = b;
                });
                n.push(s);
            } catch (s) {
                console.error(s);
            }
        }
        n.length > 0 && (o.images = [
            ...o.images,
            ...n
        ], S(), e.previewInfo.textContent = `已載入 ${o.images.length} 張圖片。`, e.downloadSection.style.display = "none", setTimeout(()=>{
            console.log("Auto-triggering preview..."), L();
        }, 100));
    }
    function S() {
        e.fileCount.textContent = o.images.length, e.imageList.innerHTML = "", o.images.forEach((n, a)=>{
            const i = document.createElement("div");
            i.className = "image-item", i.draggable = !0, i.dataset.index = a, i.innerHTML = `
            <img src="${n.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `, i.querySelector(".btn-remove").addEventListener("click", (r)=>{
                r.stopPropagation(), URL.revokeObjectURL(o.images[a].src), o.images.splice(a, 1), S(), e.downloadSection.style.display = "none";
            }), i.addEventListener("dragstart", W), i.addEventListener("dragover", A), i.addEventListener("drop", N), i.addEventListener("dragend", O), i.addEventListener("dragenter", H), i.addEventListener("dragleave", V), i.addEventListener("touchstart", _, {
                passive: !1
            }), i.addEventListener("touchmove", j, {
                passive: !1
            }), i.addEventListener("touchend", z, {
                passive: !1
            }), e.imageList.appendChild(i);
        }), e.btnMerge.disabled = o.images.length < 1;
        const t = o.images.some((n)=>n.isVideo);
        e.btnMerge.textContent = t ? "🎬 生成合併影片" : "💾 儲存合併圖", K();
    }
    function K() {
        if (e.gridColsInput) {
            const t = o.images.length || 1;
            e.gridColsInput.max = t, o.gridCols > t && (o.gridCols = t), e.gridColsInput.value = o.gridCols;
            const n = document.getElementById("grid-cols-value");
            n && (n.textContent = o.gridCols);
        }
    }
    function I() {
        if (!o.baseWidth || !o.baseHeight) return;
        const t = document.getElementById("output-value-label");
        let n = 100;
        const a = o.outputScale / 100, i = Math.round(o.baseWidth * a), r = Math.round(o.baseHeight * a);
        o.outputMode === "scale" ? (e.outputValueInput.max = 100, n = Math.round(o.outputScale), t && (t.innerHTML = `${n}% <small>(${i} x ${r})</small>`)) : o.outputMode === "width" ? (e.outputValueInput.max = o.baseWidth * 2, n = i, t && (t.innerHTML = `${n}px <small>(高: ${r}px)</small>`)) : o.outputMode === "height" && (e.outputValueInput.max = o.baseHeight * 2, n = r, t && (t.innerHTML = `${n}px <small>(寬: ${i}px)</small>`)), e.outputValueInput.value = n;
    }
    function Q() {
        R(), e.sortModal.classList.add("show"), document.body.style.overflow = "hidden";
    }
    function M() {
        e.sortModal.classList.remove("show"), document.body.style.overflow = "";
    }
    function R() {
        e.sortList.innerHTML = "", o.images.forEach((t, n)=>{
            const a = document.createElement("div");
            a.className = "sort-item", a.draggable = !0, a.dataset.index = n, a.innerHTML = `
            <img src="${t.src}" alt="Thumb" />
            <div class="info">${t.name}</div>
        `, a.addEventListener("dragstart", W), a.addEventListener("dragover", A), a.addEventListener("drop", N), a.addEventListener("dragend", O), a.addEventListener("dragenter", H), a.addEventListener("dragleave", V), a.addEventListener("touchstart", _, {
                passive: !1
            }), a.addEventListener("touchmove", j, {
                passive: !1
            }), a.addEventListener("touchend", z, {
                passive: !1
            }), e.sortList.appendChild(a);
        });
    }
    let y = null;
    function W(t) {
        y = parseInt(this.dataset.index), this.classList.add("dragging"), t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", y);
    }
    function A(t) {
        return t.preventDefault && t.preventDefault(), t.dataTransfer.dropEffect = "move", !1;
    }
    function H(t) {
        this.classList.add("drag-over");
    }
    function V(t) {
        this.classList.remove("drag-over");
    }
    function N(t) {
        t.stopPropagation && t.stopPropagation();
        const n = parseInt(this.dataset.index);
        if (y !== n) {
            const a = o.images.splice(y, 1)[0];
            o.images.splice(n, 0, a), S(), R(), e.downloadSection.style.display === "block" && L();
        }
        return !1;
    }
    function O(t) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((n)=>{
            n.classList.remove("drag-over");
        });
    }
    let E = null;
    function _(t) {
        t.touches.length === 1 && (y = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function j(t) {
        if (t.touches.length !== 1 || y === null) return;
        t.preventDefault();
        const n = t.touches[0];
        this.style.pointerEvents = "none";
        const a = document.elementFromPoint(n.clientX, n.clientY);
        this.style.pointerEvents = "auto";
        const i = a?.closest(".image-item, .sort-item");
        E && E !== i && E.classList.remove("drag-over"), i && i.dataset.index !== void 0 && parseInt(i.dataset.index) !== y ? (i.classList.add("drag-over"), E = i) : E = null;
    }
    function z(t) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", E) {
            const n = parseInt(E.dataset.index);
            if (E.classList.remove("drag-over"), y !== null && !isNaN(n) && y !== n) {
                const a = o.images.splice(y, 1)[0];
                o.images.splice(n, 0, a), S(), R(), e.downloadSection.style.display === "block" && L();
            }
        }
        E = null, y = null, document.querySelectorAll(".image-item, .sort-item").forEach((n)=>{
            n.classList.remove("dragging", "drag-over"), n.style.pointerEvents = "auto";
        });
    }
    function D(t, n, a, i, r, s) {
        const m = n.width / n.height, h = r / s;
        let v, b, d, c;
        m > h ? (v = r, b = r / m, d = a, c = i + (s - b) / 2) : (b = s, v = s * m, d = a + (r - v) / 2, c = i), t.drawImage(n, 0, 0, n.width, n.height, d, c, v, b);
    }
    function L() {
        if (o.images.length < 1) return;
        const t = o.images;
        let n = 0, a = 0;
        const i = o.gridCols, r = t.length;
        let s = o.direction;
        o.direction === "grid" && (i === 1 ? s = "vertical" : i === r && (s = "horizontal"));
        const m = [];
        let h = 0;
        if (s === "horizontal") {
            const c = o.scaleMode === "fit-first" ? t[0].height : Math.max(...t.map((l)=>l.height));
            a = c, n = t.reduce((l, g)=>l + g.width * (c / g.height), 0);
        } else if (s === "vertical") {
            const c = o.scaleMode === "fit-first" ? t[0].width : Math.max(...t.map((l)=>l.width));
            n = c, a = t.reduce((l, g)=>l + g.height * (c / g.width), 0);
        } else {
            h = o.scaleMode === "fit-first" ? t[0].width : Math.max(...t.map((l)=>l.width)), n = h * i;
            const c = Math.ceil(r / i);
            for(let l = 0; l < c; l++){
                let g = 0;
                for(let u = 0; u < i; u++){
                    const f = l * i + u;
                    if (f < r) {
                        const p = t[f], w = p.height * (h / p.width);
                        w > g && (g = w);
                    }
                }
                m.push(g);
            }
            a = m.reduce((l, g)=>l + g, 0);
        }
        o.baseWidth = n, o.baseHeight = a;
        const v = o.outputScale / 100, b = n * v, d = a * v;
        if (e.canvas.width = b, e.canvas.height = d, e.canvas.style.width = b + "px", e.ctx.fillStyle = o.bgColor, e.ctx.fillRect(0, 0, b, d), e.ctx.save(), e.ctx.scale(v, v), s === "grid") {
            let c = 0;
            const l = Math.ceil(r / i);
            for(let g = 0; g < l; g++){
                const u = m[g];
                for(let f = 0; f < i; f++){
                    const p = g * i + f;
                    p < r && D(e.ctx, t[p].img, f * h, c, h, u);
                }
                c += u;
            }
        } else {
            let c = 0;
            t.forEach((l)=>{
                let g, u, f, p;
                s === "horizontal" ? (u = a, g = l.width * (a / l.height), f = c, p = 0, c += g) : (g = n, u = l.height * (n / l.width), f = 0, p = c, c += u), D(e.ctx, l.img, f, p, g, u);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(b)} x ${Math.round(d)}`, I();
    }
    async function ee() {
        console.log("PicMerger v1.0.20 Initializing..."), J(), $(), e.btnShare && (window.Capacitor && window.Capacitor.isNativePlatform() && o.canShare ? (e.btnShare.style.setProperty("display", "block", "important"), e.btnShare.disabled = !1) : e.btnShare.style.setProperty("display", "none", "important")), X(), console.log("Event listeners attached.");
        try {
            const { default: t, merge_images: n } = await F(async ()=>{
                const { default: a, merge_images: i } = await import("./pic_wasm-C60cSF7V.js");
                return {
                    default: a,
                    merge_images: i
                };
            }, [], import.meta.url);
            await t(), x = n, console.log("WASM engine loaded successfully.");
        } catch (t) {
            console.warn("WASM 載入跳過 (採用 JS 降級引擎):", t);
        }
    }
    async function te() {
        if (!(o.images.length < 1)) {
            e.previewInfo.textContent = "正在拼圖中...", e.btnMerge.disabled = !0;
            try {
                const t = {
                    horizontal: 0,
                    vertical: 1,
                    grid: 2
                };
                let n = t[o.direction], a = !1;
                if (o.direction === "grid" && (o.gridCols === 1 ? n = t.vertical : o.gridCols === o.images.length ? n = t.horizontal : a = !0), a || !x) {
                    console.info("使用 JS 高品質引擎渲染 (Contain)..."), L();
                    const p = e.canvas.toDataURL("image/png"), w = await (await fetch(p)).blob(), C = URL.createObjectURL(w);
                    e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `處理完成！解析度: ${e.canvas.width}x${e.canvas.height} (完整顯示)`, e.btnMerge.disabled = !1, I();
                    return;
                }
                const i = await Promise.all(o.images.map((p)=>fetch(p.src).then((w)=>w.arrayBuffer()))), r = new Uint8Array(i.reduce((p, w)=>p + w.byteLength, 0)), s = new Uint32Array(o.images.length * 2);
                let m = 0;
                i.forEach((p, w)=>{
                    const C = new Uint8Array(p);
                    r.set(C, m), s[w * 2] = m, s[w * 2 + 1] = m + C.length, m += C.length;
                });
                const h = parseInt(o.bgColor.slice(1, 3), 16), v = parseInt(o.bgColor.slice(3, 5), 16), b = parseInt(o.bgColor.slice(5, 7), 16), d = performance.now(), c = x(r, s, n, 1, o.gridCols, h, v, b), l = performance.now(), g = new Blob([
                    c
                ], {
                    type: "image/png"
                }), u = URL.createObjectURL(g), f = new Image;
                f.onload = ()=>{
                    o.baseWidth = f.width, o.baseHeight = f.height, e.canvas.width = f.width, e.canvas.height = f.height, e.ctx.drawImage(f, 0, 0), e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${f.width}x${f.height} (耗時 ${(l - d).toFixed(0)}ms)`, e.btnMerge.disabled = !1, I();
                }, f.src = u;
            } catch (t) {
                console.error("Rust 處理失敗:", t), e.previewInfo.textContent = "Rust 引擎發生錯誤: " + t, e.btnMerge.disabled = !1;
            }
        }
    }
    async function T() {
        try {
            const t = e.btnMerge;
            t && (t.disabled = !0, t.textContent = "正在儲存檔案...");
            const n = e.canvas.toDataURL("image/png", .9);
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const a = n.split(",")[1], i = `PicMerger_${Date.now()}.png`;
                await k.writeFile({
                    path: `PicMerger/${i}`,
                    data: a,
                    directory: U.Documents,
                    recursive: !0
                }), await Y.show({
                    text: `儲存成功！路徑：文件/PicMerger/${i}`,
                    duration: "long"
                }), t && (t.textContent = "✅ 已儲存至文件"), alert(`儲存成功！
圖片已存於「文件/PicMerger/」資料夾中。`);
            } else {
                const a = document.createElement("a");
                a.href = n, a.download = `PicMerger_${Date.now()}.png`, a.click(), t && (t.textContent = "💾 儲存成功");
            }
            t && setTimeout(()=>{
                const a = o.images.some((i)=>i.isVideo);
                t.textContent = a ? "🎬 生成合併影片" : "💾 儲存合併圖", t.disabled = !1;
            }, 2e3);
        } catch (t) {
            console.error("儲存失敗:", t), alert("儲存失敗: " + (t.message || t)), e.btnMerge && (e.btnMerge.disabled = !1, e.btnMerge.textContent = "❌ 儲存失敗");
        }
    }
    async function ne() {
        try {
            e.btnShare.disabled = !0, e.btnShare.textContent = "正在準備分享...";
            const t = e.canvas.toDataURL("image/png", .9), n = `PicMerger_Share_${Date.now()}.png`;
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const a = t.split(",")[1], i = await k.writeFile({
                    path: n,
                    data: a,
                    directory: U.Cache
                });
                await G.share({
                    title: "分享合併圖片",
                    url: i.uri,
                    dialogTitle: "分享圖片至..."
                }), e.btnShare.textContent = "✅ 分享完成";
            } else alert("此功能僅支援行動裝置版。"), e.btnShare.textContent = "🔗 分享圖片至其他 App";
        } catch (t) {
            t.message && t.message.toLowerCase().includes("user cancelled") ? e.btnShare.textContent = "🔗 分享圖片至其他 App" : (console.error("分享失敗:", t), alert("分享失敗: " + t.message), e.btnShare.textContent = "❌ 分享失敗");
        } finally{
            setTimeout(()=>{
                e.btnShare && (!(window.Capacitor && window.Capacitor.isNativePlatform()) || !o.canShare ? e.btnShare.style.setProperty("display", "none", "important") : (e.btnShare.disabled = !1, e.btnShare.textContent = "🔗 分享圖片至其他 App"));
            }, 3e3);
        }
    }
    function ae() {
        o.images.forEach((n)=>URL.revokeObjectURL(n.src)), o.images = [], o.direction = "grid", o.gridCols = 1, o.outputScale = 100, o.outputMode = "scale", o.bgColor = "#000000", o.scaleMode = "original", o.isMerged = !1, e.gridColsInput && (e.gridColsInput.value = 1), e.bgColorInput && (e.bgColorInput.value = "#000000"), e.scaleModeSelect && (e.scaleModeSelect.value = "original");
        const t = document.getElementById("output-mode-group");
        if (t) {
            t.querySelectorAll("button").forEach((a)=>a.classList.remove("active"));
            const n = t.querySelector('[data-value="scale"]');
            n && n.classList.add("active");
        }
        S(), I(), e.ctx && e.canvas && e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height), e.previewInfo.textContent = "請上傳圖片以開始", e.downloadSection.style.display = "none", e.fileInput.value = "";
    }
    window.addEventListener("dragover", (t)=>t.preventDefault(), !1);
    window.addEventListener("drop", (t)=>t.preventDefault(), !1);
    "serviceWorker" in navigator && window.addEventListener("load", ()=>{
        try {
            navigator.serviceWorker.register("sw.js").catch((t)=>console.warn("SW register failed (ignored)"));
        } catch  {}
    });
    ee();
})();
