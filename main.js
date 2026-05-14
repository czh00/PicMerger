// 診斷日誌：如果這行沒執行，代表 JS 載入失敗
console.log("DEBUG: main.js loading...");

// 將核心函式暴露給全域，方便 HTML 直接呼叫
window.handleFiles = handleFiles;

// 動態載入套件（僅在支援環境下啟動）
let Filesystem, Directory, Share, Toast;
async function loadPlugins() {
    // 這裡改為懶加載，避免阻塞
}

let merge_images_fn = null;

// 全域狀態管理
const state = {
    images: [], // 儲存已載入的圖片物件: { img, name, width, height, src }
    direction: 'grid', // 目前預設採用網格佈局 (Grid)
    scaleMode: 'original', // 縮放模式
    bgColor: '#000000', // 畫布背景顏色
    gridCols: 1, // 網格列數
    outputScale: 100, // 輸出縮放百分比
    outputMode: 'scale', // 輸出模式: scale (比例), width (定寬), height (定高)
    baseWidth: 0, // 原始總寬度
    baseHeight: 0, // 原始總高度
    format: 'image/png', // 輸出格式
    canShare: !!navigator.share // 預先偵測分享功能
};

let elements = {};

function initElements() {
    elements = {
        dropZone: document.getElementById('main-drop-zone'),
        fileInput: document.getElementById('main-file-input'),
        imageList: document.getElementById('image-list'),
        fileCount: document.getElementById('file-count'),
        btnMerge: document.getElementById('btn-merge'),
        btnReset: document.getElementById('btn-reset'),
        gridSettings: document.getElementById('grid-settings'),
        gridColsInput: document.getElementById('grid-cols'),
        outputModeSelect: document.getElementById('output-mode'),
        outputValueInput: document.getElementById('output-value'),
        scaleModeSelect: document.getElementById('scale-mode'),
        bgColorInput: document.getElementById('bg-color'),
        canvas: document.getElementById('merge-canvas'),
        canvasWrapper: document.getElementById('canvas-wrapper'),
        ctx: document.getElementById('merge-canvas')?.getContext('2d'),
        btnSave: document.getElementById('btn-save'),
        btnShare: document.getElementById('btn-share'),
        downloadSection: document.querySelector('.download-section'),
        previewInfo: document.getElementById('preview-info'),
        sortModal: document.getElementById('sort-modal'),
        sortList: document.getElementById('sort-list'),
        btnCloseModal: document.getElementById('close-modal'),
        btnApplySort: document.getElementById('btn-apply-sort')
    };
    console.log("Elements initialized:", Object.keys(elements).filter(k => elements[k]));
}



function setupEventListeners() {
    // 終極備援：如果一般綁定失效，使用全域點擊代理
    document.addEventListener('click', (e) => {
        if (elements.fileInput && e.target === elements.fileInput) return;
        const dropZone = e.target.closest('#main-drop-zone');
        if (dropZone && elements.fileInput) {
            console.log("Global Click Delegate Triggered");
            elements.fileInput.click();
        }
    });

    if (elements.dropZone && elements.fileInput) {
        // 標準綁定
        elements.dropZone.addEventListener('click', (e) => {
            if (e.target === elements.fileInput) return;
            e.stopPropagation();
            elements.fileInput.click();
        });
        
        elements.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            elements.dropZone.classList.add('drag-over');
        });

        elements.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            elements.dropZone.classList.remove('drag-over');
        });

        elements.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            elements.dropZone.classList.remove('drag-over');
            console.log("Drop event triggered");
            if (e.dataTransfer && e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
            }
        });

        elements.fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
    } else {
        console.error("Drop zone or file input not found!");
    }

    if (elements.gridColsInput) {
        elements.gridColsInput.addEventListener('input', (e) => {
            state.gridCols = parseInt(e.target.value) || 1;
            const valDisplay = document.getElementById('grid-cols-value');
            if (valDisplay) valDisplay.textContent = state.gridCols;
            previewRender();
        });
    }

    // 輸出模式按鈕組
    const modeGroup = document.getElementById('output-mode-group');
    if (modeGroup) {
        modeGroup.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                state.outputMode = btn.dataset.value;
                state.outputScale = 100;
                modeGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                syncOutputValue();
                previewRender();
            });
        });
    }

    if (elements.outputValueInput) {
        elements.outputValueInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!val) return;

            if (state.outputMode === 'scale') {
                state.outputScale = val;
            } else if (state.outputMode === 'width' && state.baseWidth) {
                state.outputScale = (val / state.baseWidth) * 100;
            } else if (state.outputMode === 'height' && state.baseHeight) {
                state.outputScale = (val / state.baseHeight) * 100;
            }
            
            const label = document.getElementById('output-value-label');
            if (label) label.textContent = Math.round(val) + (state.outputMode === 'scale' ? '%' : 'px');
            
            previewRender();
        });
    }

    if (elements.scaleModeSelect) {
        elements.scaleModeSelect.addEventListener('change', (e) => {
            state.scaleMode = e.target.value;
            previewRender();
        });
    }

    if (elements.bgColorInput) {
        elements.bgColorInput.addEventListener('change', (e) => {
            state.bgColor = e.target.value;
            previewRender();
        });
    }

    if (elements.btnMerge) {
        elements.btnMerge.addEventListener('click', async () => {
            if (state.images.length < 2) return;
            
            elements.btnMerge.disabled = true;
            elements.btnMerge.textContent = '正在渲染畫布...';
            
            setTimeout(() => {
                try {
                    render();
                } catch (err) {
                    alert('渲染失敗: ' + err.message);
                } finally {
                    elements.btnMerge.disabled = false;
                    elements.btnMerge.textContent = '生成合併圖';
                }
            }, 100);
        });
    }
    
    if (elements.btnReset) {
        elements.btnReset.addEventListener('click', reset);
    }
    
    if (elements.btnSave) {
        elements.btnSave.addEventListener('click', saveImageToStorage);
    }
    if (elements.btnShare) {
        elements.btnShare.addEventListener('click', shareImageToDevice);
    }

    if (elements.canvasWrapper) {
        elements.canvasWrapper.addEventListener('click', () => {
            if (state.images.length > 0) {
                openSortModal();
            }
        });
    }

    if (elements.btnCloseModal) elements.btnCloseModal.addEventListener('click', closeSortModal);
    if (elements.sortModal) {
        elements.sortModal.addEventListener('click', (e) => {
            if (e.target === elements.sortModal) closeSortModal();
        });
    }

    if (elements.btnApplySort) {
        elements.btnApplySort.addEventListener('click', () => {
            closeSortModal();
            if (elements.btnMerge) elements.btnMerge.click(); // Trigger re-render
        });
    }
}

async function handleFiles(files) {
    console.log("Handling files:", files ? files.length : 0);
    if (!files || files.length === 0) return;
    
    // 確保元件已初始化 (懶加載)
    if (!elements || !elements.imageList) {
        console.log("Lazy-initializing elements...");
        initElements();
    }

    if (elements.previewInfo) elements.previewInfo.textContent = "正在處理並修正圖片方向...";
    const newImages = [];

    for (const file of Array.from(files)) {
        const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);
        if (!isImage) continue;

        try {
            const item = await new Promise((resolve, reject) => {
                const img = new Image();
                const url = URL.createObjectURL(file);
                
                img.onload = () => {
                    // 使用 Canvas "烘焙" 圖片方向
                    // 現代瀏覽器會自動依據 EXIF 旋轉 <img>，將其繪製到 Canvas 可取得修正後的點陣圖
                    const canvas = document.createElement('canvas');
                    // 使用 naturalWidth/Height 確保取得正確的視覺尺寸
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    canvas.toBlob((blob) => {
                        const orientedUrl = URL.createObjectURL(blob);
                        // 建立新的 Image 物件以載入烘焙後的 URL，確保後續計算正確
                        const orientedImg = new Image();
                        orientedImg.onload = () => {
                            URL.revokeObjectURL(url); // Clean up original
                            resolve({
                                img: orientedImg,
                                name: file.name,
                                width: orientedImg.width,
                                height: orientedImg.height,
                                src: orientedUrl
                            });
                        };
                        orientedImg.src = orientedUrl;
                    }, 'image/png');
                };
                
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error(`圖片讀取失敗: ${file.name}`));
                };
                
                img.src = url;
            });
            newImages.push(item);
        } catch (err) {
            console.error(err);
        }
    }

    if (newImages.length > 0) {
        state.images = [...state.images, ...newImages];
        updateUI();
        elements.previewInfo.textContent = `已載入 ${state.images.length} 張圖片。`;
        elements.downloadSection.style.display = 'none';
        
        // 強制延遲觸發預覽，確保 DOM 已就緒
        setTimeout(() => {
            console.log("Auto-triggering preview...");
            previewRender();
        }, 100);
    }
}

function updateUI() {
    elements.fileCount.textContent = state.images.length;
    elements.imageList.innerHTML = '';
    
    state.images.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'image-item';
        div.draggable = true;
        div.dataset.index = index;
        
        div.innerHTML = `
            <img src="${item.src}" alt="Thumb" />
            <button class="btn-remove" title="移除圖片">✕</button>
        `;
        
        // Remove button listener
        div.querySelector('.btn-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            URL.revokeObjectURL(state.images[index].src);
            state.images.splice(index, 1);
            updateUI();
            elements.downloadSection.style.display = 'none';
        });

        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('dragenter', handleDragEnter);
        div.addEventListener('dragleave', handleDragLeave);

        div.addEventListener('touchstart', handleTouchStart, { passive: false });
        div.addEventListener('touchmove', handleTouchMove, { passive: false });
        div.addEventListener('touchend', handleTouchEnd, { passive: false });

        elements.imageList.appendChild(div);
    });

    elements.btnMerge.disabled = state.images.length < 2;
    updateGridColsLimit();
}

function updateGridColsLimit() {
    if (elements.gridColsInput) {
        const count = state.images.length || 1;
        elements.gridColsInput.max = count;
        if (state.gridCols > count) state.gridCols = count;
        elements.gridColsInput.value = state.gridCols;
        
        const valDisplay = document.getElementById('grid-cols-value');
        if (valDisplay) valDisplay.textContent = state.gridCols;
    }
}

function syncOutputValue() {
    if (!state.baseWidth || !state.baseHeight) return;
    
    const label = document.getElementById('output-value-label');
    let currentVal = 100;
    const scale = state.outputScale / 100;
    const w = Math.round(state.baseWidth * scale);
    const h = Math.round(state.baseHeight * scale);

    if (state.outputMode === 'scale') {
        elements.outputValueInput.max = 100;
        currentVal = Math.round(state.outputScale);
        if (label) label.innerHTML = `${currentVal}% <small>(${w} x ${h})</small>`;
    } else if (state.outputMode === 'width') {
        elements.outputValueInput.max = state.baseWidth * 2; 
        currentVal = w;
        if (label) label.innerHTML = `${currentVal}px <small>(高: ${h}px)</small>`;
    } else if (state.outputMode === 'height') {
        elements.outputValueInput.max = state.baseHeight * 2;
        currentVal = h;
        if (label) label.innerHTML = `${currentVal}px <small>(寬: ${w}px)</small>`;
    }
    
    elements.outputValueInput.value = currentVal;
}

function moveImage(index, delta) {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= state.images.length) return;
    
    const temp = state.images[index];
    state.images[index] = state.images[newIndex];
    state.images[newIndex] = temp;
    
    updateUI();
    elements.downloadSection.style.display = 'none';
}

function openSortModal() {
    renderSortList();
    elements.sortModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSortModal() {
    elements.sortModal.classList.remove('show');
    document.body.style.overflow = '';
}

function renderSortList() {
    elements.sortList.innerHTML = '';
    state.images.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'sort-item';
        div.draggable = true;
        div.dataset.index = index;
        div.innerHTML = `
            <img src="${item.src}" alt="Thumb" />
            <div class="info">${item.name}</div>
        `;
        
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('dragenter', handleDragEnter);
        div.addEventListener('dragleave', handleDragLeave);

        div.addEventListener('touchstart', handleTouchStart, { passive: false });
        div.addEventListener('touchmove', handleTouchMove, { passive: false });
        div.addEventListener('touchend', handleTouchEnd, { passive: false });

        elements.sortList.appendChild(div);
    });
}

let draggedItemIndex = null;

function handleDragStart(e) {
    draggedItemIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedItemIndex);
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    
    const targetIndex = parseInt(this.dataset.index);
    if (draggedItemIndex !== targetIndex) {
        const item = state.images.splice(draggedItemIndex, 1)[0];
        state.images.splice(targetIndex, 0, item);
        
        updateUI();
        renderSortList();
        
        if (elements.downloadSection.style.display === 'block') {
            previewRender();
        }
    }
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.image-item, .sort-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

let lastTouchTarget = null;

function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    draggedItemIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
}

function handleTouchMove(e) {
    if (e.touches.length !== 1 || draggedItemIndex === null) return;
    e.preventDefault();

    const touch = e.touches[0];
    this.style.pointerEvents = 'none';
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    this.style.pointerEvents = 'auto';

    const item = target?.closest('.image-item, .sort-item');

    if (lastTouchTarget && lastTouchTarget !== item) {
        lastTouchTarget.classList.remove('drag-over');
    }

    if (item && item.dataset.index !== undefined && parseInt(item.dataset.index) !== draggedItemIndex) {
        item.classList.add('drag-over');
        lastTouchTarget = item;
    } else {
        lastTouchTarget = null;
    }
}

function handleTouchEnd(e) {
    this.classList.remove('dragging');
    this.style.pointerEvents = 'auto';
    
    if (lastTouchTarget) {
        const targetIndex = parseInt(lastTouchTarget.dataset.index);
        lastTouchTarget.classList.remove('drag-over');
        
        if (draggedItemIndex !== null && !isNaN(targetIndex) && draggedItemIndex !== targetIndex) {
            const item = state.images.splice(draggedItemIndex, 1)[0];
            state.images.splice(targetIndex, 0, item);
            
            updateUI();
            renderSortList();
            
            if (elements.downloadSection.style.display === 'block') {
                previewRender();
            }
        }
    }
    
    lastTouchTarget = null;
    draggedItemIndex = null;
    document.querySelectorAll('.image-item, .sort-item').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
        el.style.pointerEvents = 'auto';
    });
}

function drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const cellRatio = w / h;
    let sx, sy, sw, sh;

    if (imgRatio > cellRatio) {
        sh = img.height;
        sw = sh * cellRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
    } else {
        sw = img.width;
        sh = sw / cellRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function previewRender() {
    if (state.images.length < 1) return;
    
    const imgs = state.images;
    let canvasWidth = 0;
    let canvasHeight = 0;
    const cols = state.gridCols;
    const totalImgs = imgs.length;

    let effectiveDirection = state.direction;
    if (state.direction === 'grid') {
        if (cols === 1) effectiveDirection = 'vertical';
        else if (cols === totalImgs) effectiveDirection = 'horizontal';
    }

    if (effectiveDirection === 'horizontal') {
        const baseH = state.scaleMode === 'fit-first' ? imgs[0].height : Math.max(...imgs.map(i => i.height));
        canvasHeight = baseH;
        canvasWidth = imgs.reduce((sum, item) => sum + item.width * (baseH / item.height), 0);
    } else if (effectiveDirection === 'vertical') {
        const baseW = state.scaleMode === 'fit-first' ? imgs[0].width : Math.max(...imgs.map(i => i.width));
        canvasWidth = baseW;
        canvasHeight = imgs.reduce((sum, item) => sum + item.height * (baseW / item.width), 0);
    } else {
        const rows = Math.ceil(totalImgs / cols);
        if (state.scaleMode === 'fit-first') {
            canvasWidth = imgs[0].width * cols;
            canvasHeight = imgs[0].height * rows;
        } else {
            canvasWidth = Math.max(...imgs.map(i => i.width)) * cols;
            canvasHeight = Math.max(...imgs.map(i => i.height)) * rows;
        }
    }

    state.baseWidth = canvasWidth;
    state.baseHeight = canvasHeight;

    const finalScale = state.outputScale / 100;
    const finalWidth = canvasWidth * finalScale;
    const finalHeight = canvasHeight * finalScale;

    elements.canvas.width = finalWidth;
    elements.canvas.height = finalHeight;
    elements.canvas.style.width = finalWidth + 'px';
    
    elements.ctx.fillStyle = state.bgColor;
    elements.ctx.fillRect(0, 0, finalWidth, finalHeight);

    elements.ctx.save();
    elements.ctx.scale(finalScale, finalScale);

    if (effectiveDirection === 'grid') {
        const rows = Math.ceil(totalImgs / cols);
        const cellW = canvasWidth / cols;
        const cellH = canvasHeight / rows;

        imgs.forEach((item, index) => {
            const r = Math.floor(index / cols);
            const c = index % cols;
            drawImageCover(elements.ctx, item.img, c * cellW, r * cellH, cellW, cellH);
        });
    } else {
        let offset = 0;
        imgs.forEach(item => {
            let drawW, drawH, x, y;
            if (effectiveDirection === 'horizontal') {
                drawH = canvasHeight;
                drawW = item.width * (canvasHeight / item.height);
                x = offset; y = 0; offset += drawW;
            } else {
                drawW = canvasWidth;
                drawH = item.height * (canvasWidth / item.width);
                x = 0; y = offset; offset += drawH;
            }
            elements.ctx.drawImage(item.img, x, y, drawW, drawH);
        });
    }

    elements.ctx.restore();
    elements.downloadSection.style.display = 'block';
    elements.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(finalWidth)} x ${Math.round(finalHeight)}`;
    syncOutputValue();
}

async function init() {
    console.log("PicMerger v1.0.12 Initializing...");
    loadPlugins(); 
    initElements();
    
    if (elements.btnShare) {
        const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
        if (isNative && state.canShare) {
            elements.btnShare.style.setProperty('display', 'block', 'important');
            elements.btnShare.disabled = false;
        } else {
            elements.btnShare.style.setProperty('display', 'none', 'important');
        }
    }

    setupEventListeners();
    console.log("Event listeners attached.");
    
    try {
        const { default: initWasm, merge_images } = await import('./pkg-wasm/pic_wasm.js');
        await initWasm();
        merge_images_fn = merge_images;
        console.log("WASM engine loaded successfully.");
    } catch (e) {
        console.warn("WASM 載入跳過 (採用 JS 降級引擎):", e);
    }
}

async function render() {
    if (state.images.length < 1) return;
    
    elements.previewInfo.textContent = "正在拼圖中...";
    elements.btnMerge.disabled = true;

    try {
        const dirMap = { 'horizontal': 0, 'vertical': 1, 'grid': 2 };
        
        let effectiveDirValue = dirMap[state.direction];
        let isGrid = false;
        if (state.direction === 'grid') {
            if (state.gridCols === 1) effectiveDirValue = dirMap['vertical'];
            else if (state.gridCols === state.images.length) effectiveDirValue = dirMap['horizontal'];
            else isGrid = true;
        }

        if (isGrid || !merge_images_fn) {
            console.info("使用 JS 引擎渲染以保證比例鎖定...");
            previewRender(); 
            const dataUrl = elements.canvas.toDataURL('image/png');
            const blob = await (await fetch(dataUrl)).blob();
            const url = URL.createObjectURL(blob);
            
            elements.downloadSection.style.display = 'block';
            if (elements.btnShare) elements.btnShare.disabled = !state.canShare;
            elements.previewInfo.textContent = `處理完成！解析度: ${elements.canvas.width}x${elements.canvas.height} (比例鎖定)`;
            elements.btnMerge.disabled = false;
            syncOutputValue();
            return;
        }

        const buffers = await Promise.all(state.images.map(img => 
            fetch(img.src).then(r => r.arrayBuffer())
        ));
        
        const combinedData = new Uint8Array(buffers.reduce((sum, b) => sum + b.byteLength, 0));
        const offsets = new Uint32Array(state.images.length * 2);
        
        let currentPos = 0;
        buffers.forEach((buf, i) => {
            const arr = new Uint8Array(buf);
            combinedData.set(arr, currentPos);
            offsets[i * 2] = currentPos;
            offsets[i * 2 + 1] = currentPos + arr.length;
            currentPos += arr.length;
        });

        const r = parseInt(state.bgColor.slice(1, 3), 16);
        const g = parseInt(state.bgColor.slice(3, 5), 16);
        const b = parseInt(state.bgColor.slice(5, 7), 16);

        const startTime = performance.now();
        const mergedPng = merge_images_fn(
            combinedData,
            offsets,
            effectiveDirValue,
            1, 
            state.gridCols,
            r, g, b
        );
        const endTime = performance.now();

        const blob = new Blob([mergedPng], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        
        const resultImg = new Image();
        resultImg.onload = () => {
            state.baseWidth = resultImg.width;
            state.baseHeight = resultImg.height;
            elements.canvas.width = resultImg.width;
            elements.canvas.height = resultImg.height;
            elements.ctx.drawImage(resultImg, 0, 0);
            
            elements.downloadSection.style.display = 'block';
            if (elements.btnShare) elements.btnShare.disabled = !state.canShare;
            elements.previewInfo.textContent = `高品質 Rust 引擎處理完成！解析度: ${resultImg.width}x${resultImg.height} (耗時 ${(endTime - startTime).toFixed(0)}ms)`;
            elements.btnMerge.disabled = false;
            
            syncOutputValue();
        };
        resultImg.src = url;

    } catch (err) {
        console.error("Rust 處理失敗:", err);
        elements.previewInfo.textContent = "Rust 引擎發生錯誤: " + err;
        elements.btnMerge.disabled = false;
    }
}

async function saveImageToStorage() {
    try {
        elements.btnSave.disabled = true;
        elements.btnSave.textContent = '正在儲存至外部儲存...';

        const dataUrl = elements.canvas.toDataURL('image/png', 0.9);

        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            const base64Data = dataUrl.split(',')[1];
            const fileName = `PicMerger_${Date.now()}.png`;

            // 改用 Filesystem 寫入 Documents 檔案夾，這在 Android 上最穩定
            await Filesystem.writeFile({
                path: `PicMerger/${fileName}`,
                data: base64Data,
                directory: Directory.Documents,
                recursive: true
            });

            await Toast.show({
                text: `儲存成功！路徑：文件/PicMerger/${fileName}`,
                duration: 'long'
            });
            
            elements.btnSave.textContent = '✅ 已儲存至文件';
            alert(`儲存成功！\n圖片已存於「文件/PicMerger/」資料夾中。\n若相簿未立即出現，請手動前往查看或使用分享按鈕。`);
        } else {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `PicMerger_${Date.now()}.png`;
            link.click();
            elements.btnSave.textContent = '💾 儲存成功';
        }
    } catch (err) {
        console.error('儲存失敗:', err);
        alert('儲存失敗: ' + err.message);
        elements.btnSave.textContent = '❌ 儲存失敗';
    } finally {
        setTimeout(() => {
            elements.btnSave.disabled = false;
            elements.btnSave.textContent = '💾 直接儲存至文件資料夾';
            if (elements.btnShare) {
                elements.btnShare.disabled = !state.canShare;
            }
        }, 3000);
    }
}

async function shareImageToDevice() {
    try {
        elements.btnShare.disabled = true;
        elements.btnShare.textContent = '正在準備分享...';

        const dataUrl = elements.canvas.toDataURL('image/png', 0.9);
        const fileName = `PicMerger_Share_${Date.now()}.png`;

        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            const base64Data = dataUrl.split(',')[1];
            
            const result = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache
            });

            await Share.share({
                title: '分享合併圖片',
                url: result.uri,
                dialogTitle: '分享圖片至...'
            });
            
            elements.btnShare.textContent = '✅ 分享完成';
        } else {
            alert('此功能僅支援行動裝置版。');
            elements.btnShare.textContent = '🔗 分享圖片至其他 App';
        }
    } catch (err) {
        if (err.message && err.message.toLowerCase().includes('user cancelled')) {
            elements.btnShare.textContent = '🔗 分享圖片至其他 App';
        } else {
            console.error('分享失敗:', err);
            alert('分享失敗: ' + err.message);
            elements.btnShare.textContent = '❌ 分享失敗';
        }
    } finally {
        setTimeout(() => {
            if (elements.btnShare) {
                // 恢復時依然保持隱藏判斷
                const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
                if (!isNative || !state.canShare) {
                    elements.btnShare.style.setProperty('display', 'none', 'important');
                } else {
                    elements.btnShare.disabled = false;
                    elements.btnShare.textContent = '🔗 分享圖片至其他 App';
                }
            }
        }, 3000);
    }
}

function reset() {
    state.images.forEach(item => URL.revokeObjectURL(item.src));
    state.images = [];
    updateUI();
    elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    elements.previewInfo.textContent = '請上傳圖片以開始';
    elements.downloadSection.style.display = 'none';
    elements.fileInput.value = '';
}

// 全域攔截拖放預設行為，防止瀏覽器開圖
window.addEventListener('dragover', (e) => e.preventDefault(), false);
window.addEventListener('drop', (e) => e.preventDefault(), false);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        try {
            navigator.serviceWorker.register('sw.js').catch(e => console.warn("SW register failed (ignored)"));
        } catch (e) {}
    });
}

init();
