package com.czh.picmerger.ui

import android.content.Context
import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.compose.runtime.*
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.czh.picmerger.logic.ImageProcessor
import com.czh.picmerger.logic.VideoProcessor
import com.czh.picmerger.model.*
import com.czh.picmerger.utils.StorageHelper
import io.microshow.rxffmpeg.RxFFmpegInvoke
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

class PicViewModel : ViewModel() {
    init {
        // 初始化 RxFFmpeg 引擎並開啟調試模式
        RxFFmpegInvoke.getInstance().setDebug(true)
    }

    var images = mutableStateListOf<MediaItem>()
        private set

    var isMediaTypeVideo by mutableStateOf(false)
        private set

    var direction by mutableStateOf(MergeDirection.GRID)
    var alignment by mutableStateOf(Alignment.CENTER)
    var scaleMode by mutableStateOf(ScaleMode.ORIGINAL)
    var outputMode by mutableStateOf(OutputMode.SCALE)
    var outputValue by mutableStateOf(100f)
    var gridCols by mutableStateOf(2)
    var bgColor by mutableStateOf(0xFF000000.toInt())
    var baseWidth by mutableStateOf(1080)
    var baseHeight by mutableStateOf(1920)
    
    var previewBitmap by mutableStateOf<Bitmap?>(null)
    var finalRenderedBitmap: Bitmap? = null
    var finalRenderedVideo: File? = null
    var isRenderReady by mutableStateOf(false)
    var isProcessing by mutableStateOf(false)
    var statusMessage by mutableStateOf("請選擇媒體以開始")

    /**
     * 加入媒體檔案（圖片或影片）
     * 支援過濾重複項目、類型衝突檢查與非同步縮圖預讀
     */
    fun addMedia(context: Context, uris: List<Uri>) {
        viewModelScope.launch {
            statusMessage = "正在處理..."
            
            // Filter out duplicates based on URI
            val currentUris = images.map { it.uri }.toSet()
            val uniqueUris = uris.filter { it !in currentUris }
            
            if (uniqueUris.isEmpty() && uris.isNotEmpty()) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "所選檔案已在清單中，已自動過濾", Toast.LENGTH_SHORT).show()
                }
                statusMessage = "已過濾重複檔案"
                return@launch
            }

            // Determine if the batch is video or image
            val firstMime = uniqueUris.firstOrNull()?.let { context.contentResolver.getType(it) }
            val batchIsVideo = firstMime?.startsWith("video/") == true
            
            if (images.isNotEmpty() && isMediaTypeVideo != batchIsVideo) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "不支援同時混合圖片與影片，請清空後再選擇", Toast.LENGTH_LONG).show()
                }
                statusMessage = "混合選擇錯誤"
                return@launch
            }
            
            isMediaTypeVideo = batchIsVideo

            val newItems = uniqueUris.mapNotNull { uri ->
                val type = context.contentResolver.getType(uri) ?: ""
                val isVid = type.startsWith("video/")
                if (isVid != isMediaTypeVideo) return@mapNotNull null // Strict pure type

                val info = getMediaInfo(context, uri, isVid)
                if (info.width > 0) {
                    MediaItem(uri = uri, name = info.name, width = info.width, height = info.height, isVideo = isVid)
                } else null
            }
            
            // Pre-cache bitmaps in background for performance (including videos)
            newItems.forEach { item ->
                launch(Dispatchers.Default) {
                    item.cachedBitmap = ImageProcessor.loadBitmap(context, item, 2048)
                    // Trigger a preview update once a bitmap is cached
                    autoPreview(context)
                }
            }

            images.addAll(newItems)
            statusMessage = "已載入 ${images.size} 個項目"
            autoPreview(context)
        }
    }

    private class MediaInfo(val width: Int, val height: Int, val name: String)

    private fun getMediaInfo(context: Context, uri: Uri, isVideo: Boolean): MediaInfo {
        var w = 0
        var h = 0
        var name = "Unknown"

        try {
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (cursor.moveToFirst() && nameIndex >= 0) name = cursor.getString(nameIndex)
            }

            if (isVideo) {
                val retriever = MediaMetadataRetriever()
                retriever.setDataSource(context, uri)
                val widthStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)
                val heightStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)
                val rotationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)
                
                w = widthStr?.toIntOrNull() ?: 0
                h = heightStr?.toIntOrNull() ?: 0
                val rot = rotationStr?.toIntOrNull() ?: 0
                
                if (rot == 90 || rot == 270) {
                    val temp = w
                    w = h
                    h = temp
                }
                retriever.release()
            } else {
                val options = android.graphics.BitmapFactory.Options().apply { inJustDecodeBounds = true }
                context.contentResolver.openInputStream(uri)?.use { 
                    android.graphics.BitmapFactory.decodeStream(it, null, options)
                }
                w = options.outWidth
                h = options.outHeight

                context.contentResolver.openInputStream(uri)?.use {
                    val exif = android.media.ExifInterface(it)
                    val orientation = exif.getAttributeInt(
                        android.media.ExifInterface.TAG_ORIENTATION,
                        android.media.ExifInterface.ORIENTATION_NORMAL
                    )
                    if (orientation == android.media.ExifInterface.ORIENTATION_ROTATE_90 || 
                        orientation == android.media.ExifInterface.ORIENTATION_ROTATE_270) {
                        w = options.outHeight
                        h = options.outWidth
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return MediaInfo(w, h, name)
    }

    fun removeMedia(context: Context, item: MediaItem) {
        images.remove(item)
        if (images.isEmpty()) {
            isMediaTypeVideo = false
        }
        // Ensure gridCols doesn't exceed image count
        gridCols = gridCols.coerceAtMost(maxOf(1, images.size))
        autoPreview(context)
    }

    fun moveMedia(context: Context, fromIndex: Int, toIndex: Int) {
        if (fromIndex !in images.indices || toIndex !in images.indices) return
        val item = images.removeAt(fromIndex)
        images.add(toIndex, item)
        autoPreview(context)
    }

    private fun scaleDownForPreview(bitmap: Bitmap): Bitmap {
        val maxDim = 1024f // Reduced preview size to be even faster and safer
        val scale = minOf(1f, maxDim / bitmap.width.coerceAtLeast(bitmap.height))
        if (scale < 1f) {
            val w = (bitmap.width * scale).toInt().coerceAtLeast(1)
            val h = (bitmap.height * scale).toInt().coerceAtLeast(1)
            return Bitmap.createScaledBitmap(bitmap, w, h, true)
        }
        return bitmap
    }

    /**
     * 自動產生低解析度預覽圖
     * 用於即時反應使用者調整的佈局參數
     */
    fun autoPreview(context: Context) {
        if (images.size < 1) {
            previewBitmap = null
            isRenderReady = false
            return
        }
        viewModelScope.launch {
            isRenderReady = false
            // Calculate base dimensions for the slider
            val baseDims = withContext(Dispatchers.Default) {
                calculateBaseDimensions(context)
            }
            baseWidth = baseDims.first
            baseHeight = baseDims.second

            val result = withContext(Dispatchers.Default) {
                // For preview, we treat videos as images (extract first frame) using ImageProcessor
                ImageProcessor.mergeImages(
                    context, images, direction, alignment, scaleMode, gridCols, bgColor, 
                    20f, OutputMode.SCALE, 20f
                )
            }
            result?.let {
                previewBitmap = scaleDownForPreview(it)
            }
        }
    }

    /**
     * 計算原始合併尺寸（不縮放時的解析度）
     * 用於 UI 拉桿的上限設定
     */
    private fun calculateBaseDimensions(context: Context): Pair<Int, Int> {
        if (images.isEmpty()) return 0 to 0
        val cols = maxOf(1, gridCols)
        val rows = kotlin.math.ceil(images.size.toDouble() / cols).toInt()
        
        if (isMediaTypeVideo) {
            val minW = images.minOf { it.width }.takeIf { it > 0 } ?: 720
            val minH = images.minOf { it.height }.takeIf { it > 0 } ?: 720
            val finalW = if (minW % 2 != 0) minW - 1 else minW
            val finalH = if (minH % 2 != 0) minH - 1 else minH
            return (finalW * cols) to (finalH * rows)
        } else {
            val bitmaps = images.mapNotNull { it.cachedBitmap ?: ImageProcessor.loadBitmap(context, it) }
            if (bitmaps.isEmpty()) return 0 to 0
            val maxWidth = bitmaps.maxOf { it.width }
            val maxHeight = bitmaps.maxOf { it.height }
            return (maxWidth * cols) to (maxHeight * rows)
        }
    }

    /**
     * 執行最終合併渲染
     * 根據媒體類型自動切換圖片合成引擎或影片處理引擎
     */
    fun performMerge(context: Context, onSuccess: () -> Unit) {
        if (images.size < 1) return
        
        if (isMediaTypeVideo) {
            isProcessing = true
            statusMessage = "正在合併影片..."
            val finalScale = when (outputMode) {
                OutputMode.SCALE -> outputValue / 100f
                OutputMode.WIDTH -> if (baseWidth > 0) outputValue / baseWidth else 1f
                OutputMode.HEIGHT -> if (baseHeight > 0) outputValue / baseHeight else 1f
            }
            VideoProcessor.mergeVideos(
                context = context,
                videos = images,
                direction = direction,
                gridCols = gridCols,
                outputScale = finalScale,
                onProgress = { },
                onComplete = { file ->
                    viewModelScope.launch {
                        isProcessing = false
                        if (file != null) {
                            finalRenderedVideo = file
                            isRenderReady = true
                            statusMessage = "影片處理完成！"
                            onSuccess()
                        } else {
                            statusMessage = "影片處理失敗，請檢查檔案格式"
                        }
                    }
                }
            )
        } else {
            viewModelScope.launch {
                isProcessing = true
                statusMessage = "正在渲染合併圖..."
                val result = withContext(Dispatchers.Default) {
                    ImageProcessor.mergeImages(
                        context, images, direction, alignment, scaleMode, gridCols, bgColor, 
                        outputValue, outputMode, outputValue
                    )
                }
                isProcessing = false
                if (result != null) {
                    finalRenderedBitmap = result
                    isRenderReady = true
                    previewBitmap = scaleDownForPreview(result)
                    statusMessage = "完成！解析度: ${result.width}x${result.height}"
                    onSuccess()
                } else {
                    statusMessage = "渲染失敗"
                }
            }
        }
    }

    fun reset() {
        images.clear()
        isMediaTypeVideo = false
        previewBitmap = null
        finalRenderedBitmap = null
        finalRenderedVideo = null
        isRenderReady = false
        statusMessage = "請上傳圖片或影片以開始"
    }
}
