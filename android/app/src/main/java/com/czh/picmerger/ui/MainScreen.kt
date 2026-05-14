package com.czh.picmerger.ui

import android.graphics.Bitmap
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.czh.picmerger.model.*
import com.czh.picmerger.utils.StorageHelper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: PicViewModel = viewModel()) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 100)
    ) { uris ->
        if (uris.isNotEmpty()) {
            viewModel.addMedia(context, uris)
        }
    }

    Scaffold(
        bottomBar = {
            BottomActionTray(viewModel)
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(scrollState)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                            MaterialTheme.colorScheme.surface
                        )
                    )
                )
        ) {
            // 介面頂部標題與版本
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("圖片合併", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                Text("v1.0.30", fontSize = 12.sp, color = MaterialTheme.colorScheme.outline)
            }

            ImageSelectorArea(viewModel, onAddClick = {
                launcher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo))
            })

            SettingsPanel(viewModel)

            PreviewArea(viewModel)
            
            Spacer(modifier = Modifier.height(80.dp)) // Extra space for bottom bar
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ImageSelectorArea(viewModel: PicViewModel, onAddClick: () -> Unit) {
    val context = LocalContext.current
    val density = LocalDensity.current
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "已選 (${viewModel.images.size})",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold
                )

                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                    TextButton(
                        onClick = { viewModel.reset() },
                        modifier = Modifier.padding(end = 4.dp).height(36.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("重置", fontSize = 14.sp)
                    }
                    Button(
                        onClick = onAddClick,
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                        modifier = Modifier.height(36.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("增加")
                    }
                }
            }

            if (viewModel.images.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp)
                        .padding(top = 8.dp)
                        .border(
                            1.dp,
                            MaterialTheme.colorScheme.outlineVariant,
                            RoundedCornerShape(8.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text("尚未選取檔案", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 14.sp)
                }
            } else {
                var draggedUri by remember { mutableStateOf<Uri?>(null) }
                var fingerOffset by remember { mutableStateOf(Offset.Zero) }
                var itemSizePx by remember { mutableStateOf(0f) }
                var gridWidthPx by remember { mutableStateOf(0f) }

                // 使用 LazyVerticalGrid 實現換行 + 排序
                // 將 pointerInput 提升到容器層級，確保座標系絕對穩定
                BoxWithConstraints(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
                    gridWidthPx = with(density) { maxWidth.toPx() }
                    val minItemWidth = 72.dp
                    val spacing = 8.dp
                    val columns = (maxWidth / (minItemWidth + spacing)).toInt().coerceAtLeast(1)
                    val cellSize = maxWidth / columns
                    itemSizePx = with(density) { cellSize.toPx() }

                    LazyVerticalGrid(
                        columns = GridCells.Fixed(columns),
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 400.dp)
                            .pointerInput(Unit) {
                                detectDragGesturesAfterLongPress(
                                    onDragStart = { offset ->
                                        // 1. 根據手指按下的絕對位置，換算出對應的索引
                                        val col = (offset.x / itemSizePx).toInt()
                                        val row = (offset.y / itemSizePx).toInt()
                                        val index = (row * columns + col)
                                        if (index in viewModel.images.indices) {
                                            draggedUri = viewModel.images[index].uri
                                            fingerOffset = offset
                                        }
                                    },
                                    onDrag = { change, dragAmount ->
                                        change.consume()
                                        fingerOffset += dragAmount
                                        
                                        val currentIdx = viewModel.images.indexOfFirst { it.uri == draggedUri }
                                        if (currentIdx != -1) {
                                            // 2. 根據手指當前的絕對位置，計算目標位置
                                            val targetCol = (fingerOffset.x / itemSizePx).toInt().coerceIn(0, columns - 1)
                                            val targetRow = (fingerOffset.y / itemSizePx).toInt()
                                            val targetIdx = (targetRow * columns + targetCol).coerceIn(0, viewModel.images.size - 1)
                                            
                                            if (targetIdx != currentIdx) {
                                                viewModel.moveMedia(context, currentIdx, targetIdx)
                                            }
                                        }
                                    },
                                    onDragEnd = { draggedUri = null },
                                    onDragCancel = { draggedUri = null }
                                )
                            },
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(4.dp)
                    ) {
                        itemsIndexed(viewModel.images, key = { _, mItem -> mItem.uri }) { index, mItem ->
                            val isDragged = mItem.uri == draggedUri
                            
                            // 計算這張圖片在網格中的預定位置
                            val row = index / columns
                            val col = index % columns
                            val baseLeft = col * itemSizePx
                            val baseTop = row * itemSizePx

                            val itemModifier = if (isDragged) {
                                Modifier
                                    .zIndex(10f)
                                    .graphicsLayer {
                                        // 絕對座標偏移：手指當前位置 - 圖片原本位置 - (圖片大小/2 以對齊中心)
                                        translationX = fingerOffset.x - baseLeft - (itemSizePx / 2)
                                        translationY = fingerOffset.y - baseTop - (itemSizePx / 2)
                                        scaleX = 1.2f
                                        scaleY = 1.2f
                                        shadowElevation = 12.dp.toPx()
                                    }
                            } else {
                                Modifier.zIndex(1f)
                            }

                            Box(
                                modifier = itemModifier
                                    .size(72.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                AsyncImage(
                                    model = mItem.uri,
                                    contentDescription = null,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )

                                // 移除按鈕
                                Surface(
                                    onClick = { viewModel.removeMedia(context, mItem) },
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .size(20.dp)
                                        .padding(2.dp),
                                    shape = CircleShape,
                                    color = Color.Black.copy(alpha = 0.5f)
                                ) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Remove",
                                        tint = Color.White,
                                        modifier = Modifier.padding(2.dp)
                                    )
                                }
                                
                                if (mItem.isVideo) {
                                    Icon(
                                        Icons.Default.PlayCircle,
                                        contentDescription = null,
                                        modifier = Modifier.align(Alignment.BottomStart).size(16.dp).padding(2.dp),
                                        tint = Color.White
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MediaThumbnailItem(item: MediaItem, onRemove: () -> Unit, onMoveLeft: () -> Unit, onMoveRight: () -> Unit) {
    Box(
        modifier = Modifier
            .size(60.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.secondaryContainer)
    ) {
        AsyncImage(
            model = item.uri,
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        
        if (item.isVideo) {
            Icon(
                Icons.Default.PlayCircleOutline,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.align(Alignment.Center).size(24.dp)
            )
        }
        
        // Remove Button
        IconButton(
            onClick = onRemove,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(20.dp)
                .padding(2.dp)
                .background(Color.Black.copy(alpha = 0.5f), CircleShape)
        ) {
            Icon(Icons.Default.Close, contentDescription = null, tint = Color.White, modifier = Modifier.size(12.dp))
        }
    }
}

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun SettingsPanel(viewModel: PicViewModel) {
    val context = LocalContext.current
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(8.dp)) {


            // Grid Columns (Always visible, controls the layout)
            val maxCols = maxOf(1, viewModel.images.size)
            Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                Text("列數: ${viewModel.gridCols.coerceAtMost(maxCols)}", style = MaterialTheme.typography.labelMedium)
                Slider(
                    value = viewModel.gridCols.coerceAtMost(maxCols).toFloat(),
                    onValueChange = { 
                        viewModel.gridCols = it.toInt()
                        viewModel.autoPreview(context)
                    },
                    valueRange = 1f..maxCols.toFloat(),
                    steps = if (maxCols > 1) maxCols - 2 else 0,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )
            }

            // Disable advanced settings for videos
            val enableAdvanced = !viewModel.isMediaTypeVideo

            // Output Mode
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                Text("輸出: ", style = MaterialTheme.typography.labelMedium, color = Color.Unspecified)
                SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
                    OutputMode.values().forEachIndexed { index, mode ->
                        SegmentedButton(
                            selected = viewModel.outputMode == mode,
                            enabled = true,
                            onClick = { 
                                viewModel.outputMode = mode
                                viewModel.outputValue = when(mode) {
                                    OutputMode.SCALE -> 100f
                                    OutputMode.WIDTH -> viewModel.baseWidth.toFloat()
                                    OutputMode.HEIGHT -> viewModel.baseHeight.toFloat()
                                }
                                viewModel.autoPreview(context)
                            },
                            shape = SegmentedButtonDefaults.itemShape(index = index, count = OutputMode.values().size)
                        ) {
                            Text(when(mode) {
                                OutputMode.SCALE -> "比例"
                                OutputMode.WIDTH -> "寬度"
                                OutputMode.HEIGHT -> "高度"
                            }, fontSize = 12.sp)
                        }
                    }
                }
            }

            // Output Value Input based on Mode
            if (viewModel.outputMode == OutputMode.SCALE) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("比例: ${viewModel.outputValue.toInt()}%", style = MaterialTheme.typography.labelMedium, color = if(viewModel.outputValue > 100f) MaterialTheme.colorScheme.error else Color.Unspecified)
                    Slider(
                        value = viewModel.outputValue,
                        enabled = true,
                        onValueChange = { 
                            viewModel.outputValue = it
                            viewModel.autoPreview(context)
                        },
                        valueRange = 1f..100f,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                }
            } else {
                val maxDim = if (viewModel.outputMode == OutputMode.WIDTH) viewModel.baseWidth.toFloat() else viewModel.baseHeight.toFloat()
                val safeMaxDim = maxOf(1f, maxDim)
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().padding(top = 4.dp)) {
                    Text(
                        "${if (viewModel.outputMode == OutputMode.WIDTH) "寬度" else "高度"}: ${viewModel.outputValue.toInt()}px",
                        style = MaterialTheme.typography.labelMedium,
                        modifier = Modifier.width(100.dp),
                        color = Color.Unspecified
                    )
                    Slider(
                        value = viewModel.outputValue.coerceIn(1f, safeMaxDim),
                        onValueChange = { 
                            viewModel.outputValue = it
                            viewModel.autoPreview(context)
                        },
                        valueRange = 1f..safeMaxDim,
                        enabled = true,
                        modifier = Modifier.weight(1f).padding(horizontal = 8.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun PreviewArea(viewModel: PicViewModel) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(viewModel.statusMessage + " (雙指可縮放與拖曳預覽)", style = MaterialTheme.typography.labelSmall)
            Spacer(Modifier.height(4.dp))
            
            var scale by remember { mutableStateOf(1f) }
            var offset by remember { mutableStateOf(Offset.Zero) }
            val state = rememberTransformableState { zoomChange, offsetChange, _ ->
                // 降低操控靈敏度，縮放變化量減為 40%，位移減半，提升精確度
                val dampenedZoom = 1f + (zoomChange - 1f) * 0.4f
                scale = (scale * dampenedZoom).coerceIn(1f, 5f)
                offset += offsetChange * (scale * 0.5f)
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 100.dp)
                    .background(Color(viewModel.bgColor), RoundedCornerShape(8.dp))
                    .clipToBounds() // Ensure zoomed image doesn't overflow
                    .transformable(state),
                contentAlignment = Alignment.Center
            ) {
                viewModel.previewBitmap?.let {
                    Image(
                        bitmap = it.asImageBitmap(),
                        contentDescription = "Preview",
                        modifier = Modifier
                            .fillMaxWidth()
                            .graphicsLayer(
                                scaleX = scale,
                                scaleY = scale,
                                translationX = offset.x,
                                translationY = offset.y
                            )
                    )
                } ?: Icon(Icons.Default.Image, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(32.dp))
            }
        }
    }
}

@Composable
fun BottomActionTray(viewModel: PicViewModel) {
    val context = LocalContext.current
    Surface(
        modifier = Modifier.fillMaxWidth(),
        tonalElevation = 8.dp,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .padding(8.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { 
                    if (!viewModel.isMediaTypeVideo) {
                        // 圖片模式：自動執行 合併 -> 儲存 (秒存流程)
                        viewModel.performMerge(context) { 
                            viewModel.isProcessing = true
                            viewModel.statusMessage = "正在儲存至相簿..."
                            viewModel.finalRenderedBitmap?.let { bitmap ->
                                StorageHelper.saveBitmapToGalleryAsync(context, bitmap) { _, msg ->
                                    viewModel.isProcessing = false
                                    viewModel.statusMessage = msg
                                }
                            } ?: run { viewModel.isProcessing = false }
                        }
                    } else {
                        // 影片模式：單鍵切換邏輯
                        if (viewModel.isRenderReady) {
                            viewModel.isProcessing = true
                            viewModel.statusMessage = "正在儲存影片..."
                            viewModel.finalRenderedVideo?.let { file ->
                                StorageHelper.saveVideoToGalleryAsync(context, file) { _, msg ->
                                    viewModel.isProcessing = false
                                    viewModel.statusMessage = msg
                                }
                            } ?: run { viewModel.isProcessing = false }
                        } else {
                            viewModel.performMerge(context) { }
                        }
                    }
                },
                modifier = Modifier.weight(1f).height(48.dp),
                shape = RoundedCornerShape(12.dp),
                enabled = viewModel.images.size >= 1 && !viewModel.isProcessing
            ) {
                if (viewModel.isProcessing) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                } else {
                    val icon = if (!viewModel.isMediaTypeVideo || viewModel.isRenderReady) Icons.Default.Save else Icons.Default.AutoFixHigh
                    val text = if (!viewModel.isMediaTypeVideo) "儲存合併圖" else if (viewModel.isRenderReady) "儲存影片" else "合併影片"
                    
                    Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(text, fontSize = 14.sp)
                }
            }

            FilledTonalIconButton(
                onClick = {
                    viewModel.isProcessing = true
                    viewModel.statusMessage = "準備分享檔案..."
                    if (viewModel.isMediaTypeVideo) {
                        if (!viewModel.isRenderReady) {
                            viewModel.performMerge(context) {
                                viewModel.finalRenderedVideo?.let { 
                                    StorageHelper.shareVideo(context, it) {
                                        viewModel.isProcessing = false
                                    }
                                } ?: run { viewModel.isProcessing = false }
                            }
                        } else {
                            viewModel.finalRenderedVideo?.let { 
                                StorageHelper.shareVideo(context, it) {
                                    viewModel.isProcessing = false
                                }
                            } ?: run { viewModel.isProcessing = false }
                        }
                    } else {
                        if (viewModel.finalRenderedBitmap == null) {
                            viewModel.performMerge(context) {
                                viewModel.finalRenderedBitmap?.let { 
                                    StorageHelper.shareBitmap(context, it) {
                                        viewModel.isProcessing = false
                                    } 
                                } ?: run { viewModel.isProcessing = false }
                            }
                        } else {
                            viewModel.finalRenderedBitmap?.let { 
                                StorageHelper.shareBitmap(context, it) {
                                    viewModel.isProcessing = false
                                } 
                            } ?: run { viewModel.isProcessing = false }
                        }
                    }
                },
                modifier = Modifier.size(48.dp),
                shape = RoundedCornerShape(12.dp),
                enabled = viewModel.images.isNotEmpty() && !viewModel.isProcessing
            ) {
                Icon(Icons.Default.Share, contentDescription = "Share")
            }
        }
    }
}
