package com.czh.picmerger.logic

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.media.MediaMetadataRetriever
import android.net.Uri
import com.czh.picmerger.model.*
import java.io.InputStream
import kotlin.math.ceil
import kotlin.math.max

object ImageProcessor {

    fun mergeImages(
        context: Context,
        images: List<MediaItem>,
        direction: MergeDirection,
        alignment: Alignment,
        scaleMode: ScaleMode,
        gridCols: Int,
        bgColor: Int,
        outputScale: Float,
        outputMode: OutputMode,
        outputValue: Float
    ): Bitmap? {
        if (images.isEmpty()) return null

        // Priority: use cachedBitmap if available to avoid repeated decoding
        val bitmaps = images.mapNotNull { it.cachedBitmap ?: loadBitmap(context, it) }
        if (bitmaps.isEmpty()) return null

        // 1. Calculate Base Dimensions (Unscaled)
        var canvasWidth = 0
        var canvasHeight = 0
        val rowHeights = mutableListOf<Int>()
        val cols = max(1, gridCols)

        when (direction) {
            MergeDirection.HORIZONTAL -> {
                canvasHeight = bitmaps.maxOf { it.height }
                canvasWidth = bitmaps.sumOf { it.width }
            }
            MergeDirection.VERTICAL -> {
                canvasWidth = bitmaps.maxOf { it.width }
                canvasHeight = bitmaps.sumOf { it.height }
            }
            MergeDirection.GRID -> {
                // 1.1 設定基準寬度：以最大圖片寬度為準
                val maxW = bitmaps.maxOf { it.width }
                canvasWidth = maxW * cols
                val targetCanvasWidth = canvasWidth.toFloat()
                
                // 1.2 動態行高算法：確保每一行圖片都能無縫填充寬度
                val rowCount = ceil(bitmaps.size.toFloat() / cols).toInt()
                for (r in 0 until rowCount) {
                    var sumAspectRatios = 0f
                    val rowBitmaps = mutableListOf<Bitmap>()
                    for (c in 0 until cols) {
                        val index = r * cols + c
                        if (index < bitmaps.size) {
                            val bmp = bitmaps[index]
                            rowBitmaps.add(bmp)
                            sumAspectRatios += (bmp.width.toFloat() / bmp.height)
                        }
                    }
                    
                    if (sumAspectRatios > 0) {
                        val rowH = if (rowBitmaps.size == cols || r == 0) {
                            targetCanvasWidth / sumAspectRatios
                        } else {
                            rowHeights.lastOrNull()?.toFloat() ?: (targetCanvasWidth / cols)
                        }
                        rowHeights.add(rowH.toInt())
                    }
                }
                canvasHeight = rowHeights.sum()
            }
        }

        // 2. Calculate Final Scale
        val finalScale = when (outputMode) {
            OutputMode.SCALE -> outputScale / 100f
            OutputMode.WIDTH -> if (canvasWidth > 0) outputValue / canvasWidth else 1f
            OutputMode.HEIGHT -> if (canvasHeight > 0) outputValue / canvasHeight else 1f
        }

        val finalWidth = (canvasWidth * finalScale).toInt().coerceAtLeast(1)
        val finalHeight = (canvasHeight * finalScale).toInt().coerceAtLeast(1)

        // 3. Create Result Bitmap
        val result = try {
            Bitmap.createBitmap(finalWidth, finalHeight, Bitmap.Config.ARGB_8888)
        } catch (e: OutOfMemoryError) {
            return null
        }
        val canvas = Canvas(result)
        canvas.drawColor(bgColor)
        
        canvas.scale(finalScale, finalScale)
        val paint = Paint(Paint.FILTER_BITMAP_FLAG)

        if (direction == MergeDirection.GRID) {
            var currentY = 0f
            val cols = max(1, gridCols)
            
            for (r in 0 until rowHeights.size) {
                val rowH = rowHeights[r].toFloat()
                var currentX = 0f
                
                // 重新計算這一行每張圖的實際寬度（以填充 RowH 為準）
                val rowBitmaps = mutableListOf<Bitmap>()
                var sumAspectRatios = 0f
                for (c in 0 until cols) {
                    val index = r * cols + c
                    if (index < bitmaps.size) {
                        val bmp = bitmaps[index]
                        rowBitmaps.add(bmp)
                        sumAspectRatios += (bmp.width.toFloat() / bmp.height)
                    }
                }

                // 為了讓這行圖片無縫，每張圖的寬度 = rowH * 自身的寬高比
                // 但如果這行不滿，我們就直接並排，不強行拉伸到 canvasWidth
                for (bitmap in rowBitmaps) {
                    val aspectRatio = bitmap.width.toFloat() / bitmap.height
                    val drawW = rowH * aspectRatio
                    
                    val src = android.graphics.Rect(0, 0, bitmap.width, bitmap.height)
                    val dst = android.graphics.RectF(currentX, currentY, currentX + drawW, currentY + rowH)
                    canvas.drawBitmap(bitmap, src, dst, paint)
                    
                    currentX += drawW
                }
                currentY += rowH
            }
        } else {
            var offset = 0f
            bitmaps.forEach { bitmap ->
                var drawW = bitmap.width.toFloat()
                var drawH = bitmap.height.toFloat()
                var x = 0f
                var y = 0f

                if (direction == MergeDirection.HORIZONTAL) {
                    x = offset
                    y = (canvasHeight - drawH) / 2f
                    offset += drawW
                } else {
                    y = offset
                    x = (canvasWidth - drawW) / 2f
                    offset += drawH
                }
                
                val src = android.graphics.Rect(0, 0, bitmap.width, bitmap.height)
                val dst = android.graphics.RectF(x, y, x + drawW, y + drawH)
                canvas.drawBitmap(bitmap, src, dst, paint)
            }
        }

        return result
    }

    private fun drawImageContain(canvas: Canvas, bitmap: Bitmap, x: Float, y: Float, w: Float, h: Float, paint: Paint) {
        val imgRatio = bitmap.width.toFloat() / bitmap.height
        val cellRatio = w / h
        val drawW: Float
        val drawH: Float
        val drawX: Float
        val drawY: Float

        if (imgRatio > cellRatio) {
            drawW = w
            drawH = w / imgRatio
            drawX = x
            drawY = y + (h - drawH) / 2f
        } else {
            drawH = h
            drawW = h * imgRatio
            drawX = x + (w - drawW) / 2f
            drawY = y
        }
        
        val src = android.graphics.Rect(0, 0, bitmap.width, bitmap.height)
        val dst = android.graphics.RectF(drawX, drawY, drawX + drawW, drawY + drawH)
        canvas.drawBitmap(bitmap, src, dst, paint)
    }

    /**
     * Loads a bitmap with optional downscaling to prevent OOM and speed up processing.
     * @param maxDimension The maximum width or height of the returned bitmap. Default 2048.
     */
    fun loadBitmap(context: Context, item: MediaItem, maxDimension: Int = 2048): Bitmap? {
        if (item.cachedBitmap != null) return item.cachedBitmap
        
        return try {
            if (item.isVideo) {
                val retriever = MediaMetadataRetriever()
                retriever.setDataSource(context, item.uri)
                val bitmap = retriever.getFrameAtTime(0) // Get first frame
                retriever.release()
                bitmap
            } else {
                // First decode dimensions only
                val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                context.contentResolver.openInputStream(item.uri)?.use {
                    BitmapFactory.decodeStream(it, null, options)
                }

                // Calculate sample size
                val srcW = options.outWidth
                val srcH = options.outHeight
                var inSampleSize = 1
                if (maxDimension > 0 && (srcW > maxDimension || srcH > maxDimension)) {
                    val halfW = srcW / 2
                    val halfH = srcH / 2
                    while ((halfW / inSampleSize) >= maxDimension || (halfH / inSampleSize) >= maxDimension) {
                        inSampleSize *= 2
                    }
                }

                // Decode with sample size
                options.inJustDecodeBounds = false
                options.inSampleSize = inSampleSize
                var bitmap = context.contentResolver.openInputStream(item.uri)?.use {
                    BitmapFactory.decodeStream(it, null, options)
                }
                
                if (bitmap == null) return null

                // Handle Rotation
                var rotationDegrees = 0f
                context.contentResolver.openInputStream(item.uri)?.use {
                    val exif = android.media.ExifInterface(it)
                    val orientation = exif.getAttributeInt(
                        android.media.ExifInterface.TAG_ORIENTATION,
                        android.media.ExifInterface.ORIENTATION_NORMAL
                    )
                    rotationDegrees = when (orientation) {
                        android.media.ExifInterface.ORIENTATION_ROTATE_90 -> 90f
                        android.media.ExifInterface.ORIENTATION_ROTATE_180 -> 180f
                        android.media.ExifInterface.ORIENTATION_ROTATE_270 -> 270f
                        else -> 0f
                    }
                }

                if (rotationDegrees != 0f) {
                    val matrix = android.graphics.Matrix()
                    matrix.postRotate(rotationDegrees)
                    val rotatedBitmap = Bitmap.createBitmap(bitmap!!, 0, 0, bitmap!!.width, bitmap!!.height, matrix, true)
                    if (rotatedBitmap != bitmap) {
                        bitmap!!.recycle()
                    }
                    bitmap = rotatedBitmap
                }
                bitmap
            }
        } catch (e: Exception) {
            null
        }
    }
}
