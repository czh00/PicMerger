package com.czh.picmerger.logic

import android.content.Context
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.util.Log
import com.czh.picmerger.model.MediaItem
import com.czh.picmerger.model.MergeDirection
import io.microshow.rxffmpeg.RxFFmpegInvoke
import io.microshow.rxffmpeg.RxFFmpegSubscriber
import java.io.File
import java.io.FileOutputStream

object VideoProcessor {

    fun mergeVideos(
        context: Context,
        videos: List<MediaItem>,
        direction: MergeDirection,
        gridCols: Int,
        outputScale: Float = 1.0f,
        onProgress: (Int) -> Unit,
        onComplete: (File?) -> Unit
    ) {
        if (videos.isEmpty()) {
            onComplete(null)
            return
        }

        executeMerge(context, videos, direction, gridCols, outputScale, onComplete)
    }

    private fun executeMerge(
        context: Context,
        videos: List<MediaItem>,
        direction: MergeDirection,
        gridCols: Int,
        outputScale: Float,
        onComplete: (File?) -> Unit
    ) {
        val cacheDir = File(context.cacheDir, "video_cache")
        if (!cacheDir.exists()) cacheDir.mkdirs()

        // Copy URIs to temp files for stable processing and check audio
        val tempPaths = mutableListOf<String>()
        val hasAudioList = mutableListOf<Boolean>()
        try {
            for ((index, item) in videos.withIndex()) {
                val tempFile = File(cacheDir, "temp_in_${System.currentTimeMillis()}_$index.mp4")
                context.contentResolver.openInputStream(item.uri)?.use { input ->
                    FileOutputStream(tempFile).use { output ->
                        input.copyTo(output)
                    }
                }
                tempPaths.add(tempFile.absolutePath)
                
                // Check audio presence
                val retriever = MediaMetadataRetriever()
                retriever.setDataSource(context, item.uri)
                val hasAudio = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_HAS_AUDIO)
                hasAudioList.add(hasAudio == "yes")
                retriever.release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            onComplete(null)
            return
        }

        // Output file
        val outputFile = File(cacheDir, "merged_video_${System.currentTimeMillis()}.mp4")
        
        val cmdList = mutableListOf<String>()
        cmdList.add("-y")
        for (path in tempPaths) {
            cmdList.add("-i")
            cmdList.add(path)
        }
        
        // Build filter complex
        val filterBuilder = StringBuilder()
        
        when (direction) {
            MergeDirection.HORIZONTAL -> {
                val minHeight = videos.minOf { it.height }.takeIf { it > 0 } ?: 720
                val finalH = if (minHeight % 2 != 0) minHeight - 1 else minHeight
                videos.forEachIndexed { i, _ ->
                    filterBuilder.append("[$i:v]scale=-2:$finalH[v$i];")
                }
                val vInputs = videos.indices.joinToString("") { "[v$it]" }
                filterBuilder.append("${vInputs}hstack=inputs=${videos.size}[merged];")
            }
            MergeDirection.VERTICAL -> {
                val minWidth = videos.minOf { it.width }.takeIf { it > 0 } ?: 1280
                val finalW = if (minWidth % 2 != 0) minWidth - 1 else minWidth
                videos.forEachIndexed { i, _ ->
                    filterBuilder.append("[$i:v]scale=$finalW:-2[v$i];")
                }
                val vInputs = videos.indices.joinToString("") { "[v$it]" }
                filterBuilder.append("${vInputs}vstack=inputs=${videos.size}[merged];")
            }
            MergeDirection.GRID -> {
                val minW = videos.minOf { it.width }.takeIf { it > 0 } ?: 720
                val minH = videos.minOf { it.height }.takeIf { it > 0 } ?: 720
                
                val finalW = if (minW % 2 != 0) minW - 1 else minW
                val finalH = if (minH % 2 != 0) minH - 1 else minH
                
                videos.forEachIndexed { i, _ ->
                    filterBuilder.append("[$i:v]scale=$finalW:$finalH:force_original_aspect_ratio=increase,crop=$finalW:$finalH[v$i];")
                }
                
                val cols = kotlin.math.max(1, gridCols)
                val rows = kotlin.math.ceil(videos.size.toDouble() / cols).toInt()
                
                val rowOuts = mutableListOf<String>()
                var vIndex = 0
                for (r in 0 until rows) {
                    val elementsInRow = kotlin.math.min(cols, videos.size - r * cols)
                    if (elementsInRow > 1) {
                        val inputs = (0 until elementsInRow).joinToString("") { "[v${vIndex + it}]" }
                        filterBuilder.append("${inputs}hstack=inputs=${elementsInRow}[row$r];")
                        
                        if (elementsInRow < cols) {
                            val targetW = cols * finalW
                            filterBuilder.append("[row$r]pad=$targetW:$finalH:0:0:black[row_padded$r];")
                            rowOuts.add("[row_padded$r]")
                        } else {
                            rowOuts.add("[row$r]")
                        }
                    } else if (elementsInRow == 1) {
                        if (cols > 1) {
                            val targetW = cols * finalW
                            filterBuilder.append("[v$vIndex]pad=$targetW:$finalH:0:0:black[row_padded$r];")
                            rowOuts.add("[row_padded$r]")
                        } else {
                            rowOuts.add("[v$vIndex]")
                        }
                    }
                    vIndex += elementsInRow
                }
                
                if (rowOuts.size > 1) {
                    val inputs = rowOuts.joinToString("")
                    filterBuilder.append("${inputs}vstack=inputs=${rowOuts.size}[merged];")
                } else if (rowOuts.size == 1) {
                    val singleOut = rowOuts[0]
                    filterBuilder.append("${singleOut}format=yuv420p[merged];")
                }
            }
        }
        
        if (outputScale != 1.0f && outputScale > 0f) {
            val scaleStr = String.format(java.util.Locale.US, "%.4f", outputScale)
            filterBuilder.append("[merged]scale=trunc(iw*${scaleStr}/2)*2:trunc(ih*${scaleStr}/2)*2[vout]")
        } else {
            filterBuilder.append("[merged]format=yuv420p[vout]")
        }
        
        // Audio Mixing Logic
        val audioIndices = hasAudioList.indices.filter { hasAudioList[it] }
        if (audioIndices.size > 1) {
            filterBuilder.append(";")
            val aInputs = audioIndices.joinToString("") { "[$it:a]" }
            filterBuilder.append("${aInputs}amix=inputs=${audioIndices.size}:duration=longest[aout]")
        }

        cmdList.add("-filter_complex")
        cmdList.add(filterBuilder.toString())
        cmdList.add("-map")
        cmdList.add("[vout]")
        
        if (audioIndices.size == 1) {
            cmdList.add("-map")
            cmdList.add("${audioIndices[0]}:a")
        } else if (audioIndices.size > 1) {
            cmdList.add("-map")
            cmdList.add("[aout]")
        }

        cmdList.add("-c:v")
        cmdList.add("libx264")
        cmdList.add("-preset")
        cmdList.add("ultrafast")
        cmdList.add("-crf")
        cmdList.add("28")
        cmdList.add("-pix_fmt")
        cmdList.add("yuv420p") // Ensure compatibility
        cmdList.add("-c:a")
        cmdList.add("aac")
        cmdList.add("-shortest")
        cmdList.add(outputFile.absolutePath)

        Log.d("RxFFmpeg", "Executing arguments: ${cmdList.joinToString(" ")}")

        RxFFmpegInvoke.getInstance().runCommandRxJava(cmdList.toTypedArray())
            .subscribe(object : RxFFmpegSubscriber() {
                override fun onFinish() {
                    Log.d("RxFFmpeg", "Task Finished Successfully")
                    onComplete(outputFile)
                    tempPaths.forEach { try { File(it).delete() } catch(e: Exception) {} }
                }

                override fun onProgress(progress: Int, progressTime: Long) {
                    // progress update
                }

                override fun onCancel() {
                    onComplete(null)
                    tempPaths.forEach { try { File(it).delete() } catch(e: Exception) {} }
                }

                override fun onError(message: String?) {
                    Log.e("RxFFmpeg", "Task Error: $message")
                    onComplete(null)
                    tempPaths.forEach { try { File(it).delete() } catch(e: Exception) {} }
                }
            })
    }
}
