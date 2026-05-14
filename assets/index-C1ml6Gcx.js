(async ()=>{
    (function() {
        const t = document.createElement("link").relList;
        if (t && t.supports && t.supports("modulepreload")) return;
        for (const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);
        new MutationObserver((r)=>{
            for (const l of r)if (l.type === "childList") for (const f of l.addedNodes)f.tagName === "LINK" && f.rel === "modulepreload" && i(f);
        }).observe(document, {
            childList: !0,
            subtree: !0
        });
        function a(r) {
            const l = {};
            return r.integrity && (l.integrity = r.integrity), r.referrerPolicy && (l.referrerPolicy = r.referrerPolicy), r.crossOrigin === "use-credentials" ? l.credentials = "include" : r.crossOrigin === "anonymous" ? l.credentials = "omit" : l.credentials = "same-origin", l;
        }
        function i(r) {
            if (r.ep) return;
            r.ep = !0;
            const l = a(r);
            fetch(r.href, l);
        }
    })();
    const Z = "modulepreload", q = function(n, t) {
        return new URL(n, t).href;
    }, D = {}, F = function(t, a, i) {
        let r = Promise.resolve();
        if (a && a.length > 0) {
            let f = function(m) {
                return Promise.all(m.map((c)=>Promise.resolve(c).then((s)=>({
                            status: "fulfilled",
                            value: s
                        }), (s)=>({
                            status: "rejected",
                            reason: s
                        }))));
            };
            const u = document.getElementsByTagName("link"), b = document.querySelector("meta[property=csp-nonce]"), v = b?.nonce || b?.getAttribute("nonce");
            r = f(a.map((m)=>{
                if (m = q(m, i), m in D) return;
                D[m] = !0;
                const c = m.endsWith(".css"), s = c ? '[rel="stylesheet"]' : "";
                if (!!i) for(let g = u.length - 1; g >= 0; g--){
                    const p = u[g];
                    if (p.href === m && (!c || p.rel === "stylesheet")) return;
                }
                else if (document.querySelector(`link[href="${m}"]${s}`)) return;
                const h = document.createElement("link");
                if (h.rel = c ? "stylesheet" : Z, c || (h.as = "script"), h.crossOrigin = "", h.href = m, v && h.setAttribute("nonce", v), document.head.appendChild(h), c) return new Promise((g, p)=>{
                    h.addEventListener("load", g), h.addEventListener("error", ()=>p(new Error(`Unable to preload CSS for ${m}`)));
                });
            }));
        }
        function l(f) {
            const u = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (u.payload = f, window.dispatchEvent(u), !u.defaultPrevented) throw f;
        }
        return r.then((f)=>{
            for (const u of f || [])u.status === "rejected" && l(u.reason);
            return t().catch(l);
        });
    };
    console.log("DEBUG: main.js loading...");
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
        }), e.btnMerge && (e.btnMerge.textContent = "💾 儲存合併圖", e.btnMerge.addEventListener("click", async ()=>{
            if (o.images.length < 1) return;
            e.btnMerge.disabled = !0;
            const t = e.btnMerge.textContent;
            e.btnMerge.textContent = "正在準備檔案...", setTimeout(async ()=>{
                try {
                    await te(), await T();
                } catch (a) {
                    console.error("Save error:", a), alert("儲存失敗: " + (a.message || a));
                } finally{
                    e.btnMerge.disabled = !1, e.btnMerge.textContent = t;
                }
            }, 50);
        })), e.btnReset && e.btnReset.addEventListener("click", ae), e.btnSave && e.btnSave.addEventListener("click", T), e.btnShare && e.btnShare.addEventListener("click", ne), e.canvasWrapper && e.canvasWrapper.addEventListener("click", ()=>{
            o.images.length > 0 && Q();
        }), e.btnCloseModal && e.btnCloseModal.addEventListener("click", M), e.sortModal && e.sortModal.addEventListener("click", (t)=>{
            t.target === e.sortModal && M();
        }), e.btnApplySort && e.btnApplySort.addEventListener("click", ()=>{
            M(), L();
        });
    }
    async function P(n) {
        if (console.log("Handling files:", n ? n.length : 0), !n || n.length === 0) return;
        (!e || !e.imageList) && (console.log("Lazy-initializing elements..."), $()), e.previewInfo && (e.previewInfo.textContent = "正在處理並修正圖片方向...");
        const t = [];
        for (const a of Array.from(n))if (a.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(a.name)) try {
            const r = await new Promise((l, f)=>{
                const u = new Image, b = URL.createObjectURL(a);
                u.onload = ()=>{
                    const v = document.createElement("canvas");
                    v.width = u.width, v.height = u.height, v.getContext("2d").drawImage(u, 0, 0, v.width, v.height), v.toBlob((c)=>{
                        const s = URL.createObjectURL(c), d = new Image;
                        d.onload = ()=>{
                            URL.revokeObjectURL(b), l({
                                img: d,
                                name: a.name,
                                width: d.width,
                                height: d.height,
                                src: s
                            });
                        }, d.src = s;
                    }, "image/png");
                }, u.onerror = ()=>{
                    URL.revokeObjectURL(b), f(new Error(`圖片讀取失敗: ${a.name}`));
                }, u.src = b;
            });
            t.push(r);
        } catch (r) {
            console.error(r);
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
            }), a.addEventListener("dragstart", W), a.addEventListener("dragover", H), a.addEventListener("drop", O), a.addEventListener("dragend", j), a.addEventListener("dragenter", A), a.addEventListener("dragleave", N), a.addEventListener("touchstart", _, {
                passive: !1
            }), a.addEventListener("touchmove", z, {
                passive: !1
            }), a.addEventListener("touchend", V, {
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
        const a = o.outputScale / 100, i = Math.round(o.baseWidth * a), r = Math.round(o.baseHeight * a);
        o.outputMode === "scale" ? (e.outputValueInput.max = 100, t = Math.round(o.outputScale), n && (n.innerHTML = `${t}% <small>(${i} x ${r})</small>`)) : o.outputMode === "width" ? (e.outputValueInput.max = o.baseWidth * 2, t = i, n && (n.innerHTML = `${t}px <small>(高: ${r}px)</small>`)) : o.outputMode === "height" && (e.outputValueInput.max = o.baseHeight * 2, t = r, n && (n.innerHTML = `${t}px <small>(寬: ${i}px)</small>`)), e.outputValueInput.value = t;
    }
    function Q() {
        R(), e.sortModal.classList.add("show"), document.body.style.overflow = "hidden";
    }
    function M() {
        e.sortModal.classList.remove("show"), document.body.style.overflow = "";
    }
    function R() {
        e.sortList.innerHTML = "", o.images.forEach((n, t)=>{
            const a = document.createElement("div");
            a.className = "sort-item", a.draggable = !0, a.dataset.index = t, a.innerHTML = `
            <img src="${n.src}" alt="Thumb" />
            <div class="info">${n.name}</div>
        `, a.addEventListener("dragstart", W), a.addEventListener("dragover", H), a.addEventListener("drop", O), a.addEventListener("dragend", j), a.addEventListener("dragenter", A), a.addEventListener("dragleave", N), a.addEventListener("touchstart", _, {
                passive: !1
            }), a.addEventListener("touchmove", z, {
                passive: !1
            }), a.addEventListener("touchend", V, {
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
    function O(n) {
        n.stopPropagation && n.stopPropagation();
        const t = parseInt(this.dataset.index);
        if (y !== t) {
            const a = o.images.splice(y, 1)[0];
            o.images.splice(t, 0, a), I(), R(), e.downloadSection.style.display === "block" && L();
        }
        return !1;
    }
    function j(n) {
        this.classList.remove("dragging"), document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("drag-over");
        });
    }
    let E = null;
    function _(n) {
        n.touches.length === 1 && (y = parseInt(this.dataset.index), this.classList.add("dragging"));
    }
    function z(n) {
        if (n.touches.length !== 1 || y === null) return;
        n.preventDefault();
        const t = n.touches[0];
        this.style.pointerEvents = "none";
        const a = document.elementFromPoint(t.clientX, t.clientY);
        this.style.pointerEvents = "auto";
        const i = a?.closest(".image-item, .sort-item");
        E && E !== i && E.classList.remove("drag-over"), i && i.dataset.index !== void 0 && parseInt(i.dataset.index) !== y ? (i.classList.add("drag-over"), E = i) : E = null;
    }
    function V(n) {
        if (this.classList.remove("dragging"), this.style.pointerEvents = "auto", E) {
            const t = parseInt(E.dataset.index);
            if (E.classList.remove("drag-over"), y !== null && !isNaN(t) && y !== t) {
                const a = o.images.splice(y, 1)[0];
                o.images.splice(t, 0, a), I(), R(), e.downloadSection.style.display === "block" && L();
            }
        }
        E = null, y = null, document.querySelectorAll(".image-item, .sort-item").forEach((t)=>{
            t.classList.remove("dragging", "drag-over"), t.style.pointerEvents = "auto";
        });
    }
    function B(n, t, a, i, r, l) {
        const f = t.width / t.height, u = r / l;
        let b, v, m, c;
        f > u ? (b = r, v = r / f, m = a, c = i + (l - v) / 2) : (v = l, b = l * f, m = a + (r - b) / 2, c = i), n.drawImage(t, 0, 0, t.width, t.height, m, c, b, v);
    }
    function L() {
        if (o.images.length < 1) return;
        const n = o.images;
        let t = 0, a = 0;
        const i = o.gridCols, r = n.length;
        let l = o.direction;
        i === 1 ? l = "vertical" : i === r && (l = "horizontal");
        const f = [];
        let u = 0;
        if (l === "horizontal") {
            const c = o.scaleMode === "fit-first" ? n[0].height : Math.max(...n.map((s)=>s.height));
            a = c, t = n.reduce((s, d)=>s + d.width * (c / d.height), 0);
        } else if (l === "vertical") {
            const c = o.scaleMode === "fit-first" ? n[0].width : Math.max(...n.map((s)=>s.width));
            t = c, a = n.reduce((s, d)=>s + d.height * (c / d.width), 0);
        } else {
            u = o.scaleMode === "fit-first" ? n[0].width : Math.max(...n.map((s)=>s.width)), t = u * i;
            const c = Math.ceil(r / i);
            for(let s = 0; s < c; s++){
                let d = 0;
                for(let h = 0; h < i; h++){
                    const g = s * i + h;
                    if (g < r) {
                        const p = n[g], w = p.height * (u / p.width);
                        w > d && (d = w);
                    }
                }
                f.push(d);
            }
            a = f.reduce((s, d)=>s + d, 0);
        }
        o.baseWidth = t, o.baseHeight = a;
        const b = o.outputScale / 100, v = t * b, m = a * b;
        if (e.canvas.width = v, e.canvas.height = m, e.canvas.style.width = v + "px", e.ctx.fillStyle = o.bgColor, e.ctx.fillRect(0, 0, v, m), e.ctx.save(), e.ctx.scale(b, b), l === "grid") {
            let c = 0;
            const s = Math.ceil(r / i);
            for(let d = 0; d < s; d++){
                const h = f[d];
                for(let g = 0; g < i; g++){
                    const p = d * i + g;
                    p < r && B(e.ctx, n[p].img, g * u, c, u, h);
                }
                c += h;
            }
        } else {
            let c = 0;
            n.forEach((s)=>{
                let d, h, g, p;
                l === "horizontal" ? (h = a, d = s.width * (a / s.height), g = c, p = 0, c += d) : (d = t, h = s.height * (t / s.width), g = 0, p = c, c += h), B(e.ctx, s.img, g, p, d, h);
            });
        }
        e.ctx.restore(), e.downloadSection.style.display = "block", e.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(v)} x ${Math.round(m)}`, C();
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
            await n(), x = t, console.log("WASM engine loaded successfully.");
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
                if (o.direction === "grid" && (o.gridCols === 1 ? t = n.vertical : o.gridCols === o.images.length ? t = n.horizontal : a = !0), a || !x) {
                    console.info("使用 JS 高品質引擎渲染 (Contain)..."), L();
                    const p = e.canvas.toDataURL("image/png"), w = await (await fetch(p)).blob(), S = URL.createObjectURL(w);
                    e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `處理完成！解析度: ${e.canvas.width}x${e.canvas.height} (完整顯示)`, e.btnMerge.disabled = !1, C();
                    return;
                }
                const i = await Promise.all(o.images.map((p)=>fetch(p.src).then((w)=>w.arrayBuffer()))), r = new Uint8Array(i.reduce((p, w)=>p + w.byteLength, 0)), l = new Uint32Array(o.images.length * 2);
                let f = 0;
                i.forEach((p, w)=>{
                    const S = new Uint8Array(p);
                    r.set(S, f), l[w * 2] = f, l[w * 2 + 1] = f + S.length, f += S.length;
                });
                const u = parseInt(o.bgColor.slice(1, 3), 16), b = parseInt(o.bgColor.slice(3, 5), 16), v = parseInt(o.bgColor.slice(5, 7), 16), m = performance.now(), c = x(r, l, t, 1, o.gridCols, u, b, v), s = performance.now(), d = new Blob([
                    c
                ], {
                    type: "image/png"
                }), h = URL.createObjectURL(d), g = new Image;
                g.onload = ()=>{
                    o.baseWidth = g.width, o.baseHeight = g.height, e.canvas.width = g.width, e.canvas.height = g.height, e.ctx.drawImage(g, 0, 0), e.downloadSection.style.display = "block", e.btnShare && (e.btnShare.disabled = !o.canShare), e.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${g.width}x${g.height} (耗時 ${(s - m).toFixed(0)}ms)`, e.btnMerge.disabled = !1, C();
                }, g.src = h;
            } catch (n) {
                console.error("Rust 處理失敗:", n), e.previewInfo.textContent = "Rust 引擎發生錯誤: " + n, e.btnMerge.disabled = !1;
            }
        }
    }
    async function T() {
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
