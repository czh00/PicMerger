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

        when (direction) {
            MergeDirection.HORIZONTAL -> {
                if (scaleMode == ScaleMode.FIT_FIRST) {
                    val baseH = bitmaps[0].height
                    canvasHeight = baseH
                    bitmaps.forEach { 
                        canvasWidth += (it.width * (baseH.toFloat() / it.height)).toInt()
                    }
                } else {
                    canvasHeight = bitmaps.maxOf { it.height }
                    canvasWidth = bitmaps.sumOf { it.width }
                }
            }
            MergeDirection.VERTICAL -> {
                if (scaleMode == ScaleMode.FIT_FIRST) {
                    val baseW = bitmaps[0].width
                    canvasWidth = baseW
                    bitmaps.forEach {
                        canvasHeight += (it.height * (baseW.toFloat() / it.width)).toInt()
                    }
                } else {
                    canvasWidth = bitmaps.maxOf { it.width }
                    canvasHeight = bitmaps.sumOf { it.height }
                }
            }
            MergeDirection.GRID -> {
                val cols = max(1, gridCols)
                val rows = ceil(bitmaps.size.toFloat() / cols).toInt()
                if (scaleMode == ScaleMode.FIT_FIRST) {
                    canvasWidth = bitmaps[0].width * cols
                    canvasHeight = bitmaps[0].height * rows
                } else {
                    canvasWidth = bitmaps.maxOf { it.width } * cols
                    canvasHeight = bitmaps.maxOf { it.height } * rows
                }
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
            val cols = max(1, gridCols)
            val rows = ceil(bitmaps.size.toFloat() / cols).toInt()
            val cellW = canvasWidth / cols
            val cellH = if (rows > 0) canvasHeight / rows else canvasHeight

            bitmaps.forEachIndexed { index, bitmap ->
                val r = index / cols
                val c = index % cols
                
                val scaleW = cellW.toFloat() / bitmap.width
                val scaleH = cellH.toFloat() / bitmap.height
                val fitScale = Math.min(scaleW, scaleH)
                
                val drawW = (bitmap.width * fitScale).toInt()
                val drawH = (bitmap.height * fitScale).toInt()

                var x = (c * cellW).toFloat()
                var y = (r * cellH).toFloat()

                when (alignment) {
                    Alignment.CENTER -> {
                        x += (cellW - drawW) / 2f
                        y += (cellH - drawH) / 2f
                    }
                    Alignment.END -> {
                        x += (cellW - drawW).toFloat()
                        y += (cellH - drawH).toFloat()
                    }
                    else -> {}
                }
                
                val src = android.graphics.Rect(0, 0, bitmap.width, bitmap.height)
                val dst = android.graphics.RectF(x, y, x + drawW, y + drawH)
                canvas.drawBitmap(bitmap, src, dst, paint)
            }
        } else {
            var offset = 0f
            bitmaps.forEach { bitmap ->
                var drawW = bitmap.width.toFloat()
                var drawH = bitmap.height.toFloat()
                var x = 0f
                var y = 0f

                if (direction == MergeDirection.HORIZONTAL) {
                    if (scaleMode == ScaleMode.FIT_FIRST) {
                        val scale = canvasHeight.toFloat() / bitmap.height
                        drawW *= scale
                        drawH *= scale
                    }
                    x = offset
                    when (alignment) {
                        Alignment.CENTER -> y = (canvasHeight - drawH) / 2f
                        Alignment.END -> y = canvasHeight - drawH.toFloat()
                        else -> {}
                    }
                    offset += drawW
                } else {
                    if (scaleMode == ScaleMode.FIT_FIRST) {
                        val scale = canvasWidth.toFloat() / bitmap.width
                        drawW *= scale
                        drawH *= scale
                    }
                    y = offset
                    when (alignment) {
                        Alignment.CENTER -> x = (canvasWidth - drawW) / 2f
                        Alignment.END -> x = canvasWidth - drawW.toFloat()
                        else -> {}
                    }
                    offset += drawH
                }
                
                val src = android.graphics.Rect(0, 0, bitmap.width, bitmap.height)
                val dst = android.graphics.RectF(x, y, x + drawW, y + drawH)
                canvas.drawBitmap(bitmap, src, dst, paint)
            }
        }

        return result
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
