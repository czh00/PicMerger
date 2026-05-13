import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import initWasm, { merge_images } from './pkg-wasm/pic_wasm.js';

// Initialize Rust Wasm Engine
try {
    await initWasm();
} catch (e) {
    console.warn("WASM 初始化跳過:", e);
}

// 全域狀態管理
const state = {
    images: [], // 儲存已載入的圖片物件: { img, name, width, height, src }
    direction: 'grid', // 目前預設採用網格佈局 (Grid)
    alignment: 'center', // 對齊方式: start, center, end
    scaleMode: 'original', // 縮放模式
    bgColor: '#000000', // 畫布背景顏色
    gridCols: 2, // 網格列數
    outputScale: 100, // 輸出縮放百分比
    outputMode: 'scale', // 輸出模式: scale (比例), width (定寬), height (定高)
    baseWidth: 0, // 原始總寬度
    baseHeight: 0, // 原始總高度
    format: 'image/png' // 輸出格式
};

const elements = {
    dropZone: document.getElementById('main-drop-zone'),
    fileInput: document.getElementById('main-file-input'),
    imageList: document.getElementById('image-list'),
    fileCount: document.getElementById('file-count'),
    btnMerge: document.getElementById('btn-merge'),
    btnReset: document.getElementById('btn-reset'),
    dirBtns: [document.getElementById('dir-h'), document.getElementById('dir-v'), document.getElementById('dir-g')],
    gridSettings: document.getElementById('grid-settings'),
    gridColsInput: document.getElementById('grid-cols'),
    outputModeSelect: document.getElementById('output-mode'),
    outputValueInput: document.getElementById('output-value'),
    alignmentSelect: document.getElementById('alignment'),
    scaleModeSelect: document.getElementById('scale-mode'),
    bgColorInput: document.getElementById('bg-color'),
    canvas: document.getElementById('merge-canvas'),
    canvasWrapper: document.getElementById('canvas-wrapper'),
    ctx: document.getElementById('merge-canvas').getContext('2d'),
    btnSave: document.getElementById('btn-save'),
    btnShare: document.getElementById('btn-share'),
    downloadSection: document.querySelector('.download-section'),
    previewInfo: document.getElementById('preview-info'),
    // Modal elements
    sortModal: document.getElementById('sort-modal'),
    sortList: document.getElementById('sort-list'),
    btnCloseModal: document.getElementById('close-modal'),
    btnApplySort: document.getElementById('btn-apply-sort')
};

function init() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('drag-over');
    });

    elements.dropZone.addEventListener('dragleave', () => elements.dropZone.classList.remove('drag-over'));

    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    elements.fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 網格列數變更事件
    elements.gridColsInput.addEventListener('change', (e) => {
        const max = state.images.length || 1;
        state.gridCols = Math.min(max, Math.max(1, parseInt(e.target.value) || 1));
        e.target.value = state.gridCols;
        previewRender();
    });

    elements.outputModeSelect.addEventListener('change', (e) => {
        state.outputMode = e.target.value;
        state.outputScale = 100; // Reset to 100% when switching modes
        syncOutputValue();
        previewRender();
    });

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

    elements.alignmentSelect.addEventListener('change', (e) => {
        state.alignment = e.target.value;
        previewRender();
    });

    elements.scaleModeSelect.addEventListener('change', (e) => {
        state.scaleMode = e.target.value;
        previewRender();
    });

    elements.bgColorInput.addEventListener('change', (e) => {
        state.bgColor = e.target.value;
        previewRender();
    });

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
    
    elements.btnReset.addEventListener('click', reset);
    
    if (elements.btnSave) {
        elements.btnSave.addEventListener('click', saveImageToStorage);
    }
    if (elements.btnShare) {
        elements.btnShare.addEventListener('click', shareImageToDevice);
    }

    // Modal listeners
    elements.canvasWrapper.addEventListener('click', () => {
        if (state.images.length > 0) {
            openSortModal();
        }
    });

    elements.btnCloseModal.addEventListener('click', closeSortModal);
    elements.sortModal.addEventListener('click', (e) => {
        if (e.target === elements.sortModal) closeSortModal();
    });

    elements.btnApplySort.addEventListener('click', () => {
        closeSortModal();
        elements.btnMerge.click(); // Trigger re-render
    });
}

async function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    elements.previewInfo.textContent = "正在處理並修正圖片方向...";
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

        // Drag and Drop Events for Main List
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('dragenter', handleDragEnter);
        div.addEventListener('dragleave', handleDragLeave);

        // Touch Events for Mobile
        div.addEventListener('touchstart', handleTouchStart, { passive: false });
        div.addEventListener('touchmove', handleTouchMove, { passive: false });
        div.addEventListener('touchend', handleTouchEnd, { passive: false });

        elements.imageList.appendChild(div);
    });

    elements.btnMerge.disabled = state.images.length < 2;
}

function syncOutputValue() {
    if (!state.baseWidth || !state.baseHeight) return;
    
    const label = document.getElementById('output-value-label');
    let currentVal = 100;

    if (state.outputMode === 'scale') {
        elements.outputValueInput.max = 100;
        currentVal = Math.round(state.outputScale);
    } else if (state.outputMode === 'width') {
        elements.outputValueInput.max = state.baseWidth;
        currentVal = Math.round(state.baseWidth * (state.outputScale / 100));
    } else if (state.outputMode === 'height') {
        elements.outputValueInput.max = state.baseHeight;
        currentVal = Math.round(state.baseHeight * (state.outputScale / 100));
    }
    
    elements.outputValueInput.value = currentVal;
    if (label) label.textContent = currentVal + (state.outputMode === 'scale' ? '%' : 'px');
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
        
        // Drag and Drop Events
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('dragenter', handleDragEnter);
        div.addEventListener('dragleave', handleDragLeave);

        // Touch Events for Mobile
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
    // Fix for Firefox
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
        // Move item instead of swapping (Insertion logic)
        const item = state.images.splice(draggedItemIndex, 1)[0];
        state.images.splice(targetIndex, 0, item);
        
        updateUI();
        renderSortList();
        
        // Auto-render if preview was already shown
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

// Touch Handlers for Mobile
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
    
    // Disable pointer events on dragged item to "see through" it
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
            // Move item instead of swapping (Insertion logic)
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

// JS 即時預覽引擎 (採用 CSS 視覺縮放以提升效能)
function previewRender() {
    if (state.images.length < 1) return;
    
    const imgs = state.images;
    let canvasWidth = 0;
    let canvasHeight = 0;

    // Calculate dimensions based on mode
    if (state.direction === 'horizontal') {
        if (state.scaleMode === 'fit-first') {
            const baseH = imgs[0].height;
            canvasHeight = baseH;
            imgs.forEach(item => {
                canvasWidth += item.width * (baseH / item.height);
            });
        } else {
            canvasHeight = Math.max(...imgs.map(i => i.height));
            canvasWidth = imgs.reduce((sum, i) => sum + i.width, 0);
        }
    } else if (state.direction === 'vertical') {
        if (state.scaleMode === 'fit-first') {
            const baseW = imgs[0].width;
            canvasWidth = baseW;
            imgs.forEach(item => {
                canvasHeight += item.height * (baseW / item.width);
            });
        } else {
            canvasWidth = Math.max(...imgs.map(i => i.width));
            canvasHeight = imgs.reduce((sum, i) => sum + i.height, 0);
        }
    } else if (state.direction === 'grid') {
        const cols = state.gridCols;
        const rows = Math.ceil(imgs.length / cols);
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

    // Apply scaling
    const finalScale = state.outputScale / 100;
    const finalWidth = canvasWidth * finalScale;
    const finalHeight = canvasHeight * finalScale;

    elements.canvas.width = finalWidth;
    elements.canvas.height = finalHeight;
    
    // Apply CSS width for visual scaling feedback (max-width 100% still applies from CSS)
    elements.canvas.style.width = finalWidth + 'px';
    
    elements.ctx.fillStyle = state.bgColor;
    elements.ctx.fillRect(0, 0, finalWidth, finalHeight);

    elements.ctx.save();
    elements.ctx.scale(finalScale, finalScale);

    if (state.direction === 'grid') {
        const cols = state.gridCols;
        const cellW = canvasWidth / cols;
        const cellH = canvasHeight / Math.ceil(imgs.length / cols);

        imgs.forEach((item, index) => {
            const r = Math.floor(index / cols);
            const c = index % cols;
            
            const scaleW = cellW / item.width;
            const scaleH = cellH / item.height;
            const fitScale = (state.scaleMode === 'fit-first') ? Math.min(scaleW, scaleH) : Math.min(scaleW, scaleH);
            // Actually in grid, we always fit to cell
            
            const drawW = item.width * fitScale;
            const drawH = item.height * fitScale;

            let x = c * cellW;
            let y = r * cellH;

            if (state.alignment === 'center') {
                x += (cellW - drawW) / 2;
                y += (cellH - drawH) / 2;
            } else if (state.alignment === 'end') {
                x += (cellW - drawW);
                y += (cellH - drawH);
            }
            elements.ctx.drawImage(item.img, x, y, drawW, drawH);
        });
    } else {
        let offset = 0;
        imgs.forEach(item => {
            let drawW = item.width;
            let drawH = item.height;
            let x = 0, y = 0;

            if (state.direction === 'horizontal') {
                if (state.scaleMode === 'fit-first') {
                    const scale = canvasHeight / item.height;
                    drawW *= scale;
                    drawH *= scale;
                }
                x = offset;
                if (state.alignment === 'center') y = (canvasHeight - drawH) / 2;
                else if (state.alignment === 'end') y = canvasHeight - drawH;
                offset += drawW;
            } else {
                if (state.scaleMode === 'fit-first') {
                    const scale = canvasWidth / item.width;
                    drawW *= scale;
                    drawH *= scale;
                }
                y = offset;
                if (state.alignment === 'center') x = (canvasWidth - drawW) / 2;
                else if (state.alignment === 'end') x = canvasWidth - drawW;
                offset += drawH;
            }
            elements.ctx.drawImage(item.img, x, y, drawW, drawH);
        });
    }

    elements.ctx.restore();
    elements.downloadSection.style.display = 'block';
    elements.previewInfo.textContent = `即時預覽中... 解析度: ${Math.round(finalWidth)} x ${Math.round(finalHeight)} (${state.outputScale.toFixed(1)}%)`;
    syncOutputValue();
}

// 高品質 Rust WASM 拼接引擎
async function render() {
    if (state.images.length < 1) return;
    
    elements.previewInfo.textContent = "Rust 引擎正在拼圖中...";
    elements.btnMerge.disabled = true;

    try {
        // Collect all image data as a single buffer for Rust
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

        const dirMap = { 'horizontal': 0, 'vertical': 1, 'grid': 2 };
        const alignMap = { 'start': 0, 'center': 1, 'end': 2 };
        
        const r = parseInt(state.bgColor.slice(1, 3), 16);
        const g = parseInt(state.bgColor.slice(3, 5), 16);
        const b = parseInt(state.bgColor.slice(5, 7), 16);

        // Call Rust Engine
        const startTime = performance.now();
        let mergedPng;
        try {
            mergedPng = merge_images(
                combinedData,
                offsets,
                dirMap[state.direction],
                alignMap[state.alignment],
                state.gridCols,
                r, g, b
            );
        } catch (wasmErr) {
            if (wasmErr.message === "WASM_MISSING" || wasmErr.toString().includes("WASM_MISSING")) {
                console.info("使用 JS Fallback 引擎渲染...");
                previewRender(); // 呼叫 Canvas 預覽渲染
                const dataUrl = elements.canvas.toDataURL('image/png');
                const blob = await (await fetch(dataUrl)).blob();
                const url = URL.createObjectURL(blob);
                
                elements.downloadSection.style.display = 'block';
                elements.previewInfo.textContent = `JS 引擎處理完成！解析度: ${elements.canvas.width}x${elements.canvas.height}`;
                elements.btnMerge.disabled = false;
                syncOutputValue();
                return;
            }
            throw wasmErr;
        }
        const endTime = performance.now();
        console.log(`Rust 拼接耗時: ${(endTime - startTime).toFixed(2)}ms`);

        // Display Result
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
            elements.btnShare.disabled = false;
            elements.btnShare.textContent = '🔗 分享圖片至其他 App';
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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

init();
