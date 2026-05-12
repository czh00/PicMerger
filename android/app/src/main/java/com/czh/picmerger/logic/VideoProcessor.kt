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
        onProgress: (Int) -> Unit,
        onComplete: (File?) -> Unit
    ) {
        if (videos.isEmpty()) {
            onComplete(null)
            return
        }

        executeMerge(context, videos, direction, gridCols, onComplete)
    }

    private fun executeMerge(
        context: Context,
        videos: List<MediaItem>,
        direction: MergeDirection,
        gridCols: Int,
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
                videos.forEachIndexed { i, _ ->
                    filterBuilder.append("[$i:v]scale=-2:$minHeight[v$i];")
                }
                val vInputs = videos.indices.joinToString("") { "[v$it]" }
                filterBuilder.append("${vInputs}hstack=inputs=${videos.size}[vout]")
            }
            MergeDirection.VERTICAL -> {
                val minWidth = videos.minOf { it.width }.takeIf { it > 0 } ?: 1280
                videos.forEachIndexed { i, _ ->
                    filterBuilder.append("[$i:v]scale=$minWidth:-2[v$i];")
                }
                val vInputs = videos.indices.joinToString("") { "[v$it]" }
                filterBuilder.append("${vInputs}vstack=inputs=${videos.size}[vout]")
            }
            MergeDirection.GRID -> {
                val minW = videos.minOf { it.width }.takeIf { it > 0 } ?: 720
                val minH = videos.minOf { it.height }.takeIf { it > 0 } ?: 720
                
                videos.forEachIndexed { i, _ ->
                    filterBuilder.append("[$i:v]scale=$minW:$minH:force_original_aspect_ratio=increase,crop=$minW:$minH[v$i];")
                }
                
                val cols = kotlin.math.max(1, gridCols)
                val layoutBuilder = StringBuilder()
                var r = 0
                var c = 0
                for (i in videos.indices) {
                    if (i > 0) layoutBuilder.append("|")
                    if (c == 0) {
                        if (r == 0) layoutBuilder.append("0")
                        else {
                            val prevRowsH = (0 until r).joinToString("+") { "h$it" }
                            layoutBuilder.append("0_$prevRowsH")
                        }
                    } else {
                        val prevColsW = (0 until c).joinToString("+") { "w$it" }
                        if (r == 0) layoutBuilder.append("$prevColsW" + "_0")
                        else {
                            val prevRowsH = (0 until r).joinToString("+") { "h$it" }
                            layoutBuilder.append("${prevColsW}_$prevRowsH")
                        }
                    }
                    c++
                    if (c >= cols) {
                        c = 0
                        r++
                    }
                }
                val vInputs = videos.indices.joinToString("") { "[v$it]" }
                filterBuilder.append("${vInputs}xstack=inputs=${videos.size}:layout=${layoutBuilder}[vout]")
            }
        }
        
        // Audio Mixing Logic
        val audioIndices = hasAudioList.indices.filter { hasAudioList[it] }
        if (audioIndices.isNotEmpty()) {
            filterBuilder.append(";")
            val aInputs = audioIndices.joinToString("") { "[$it:a]" }
            filterBuilder.append("${aInputs}amix=inputs=${audioIndices.size}:duration=longest[aout]")
        }

        cmdList.add("-filter_complex")
        cmdList.add(filterBuilder.toString())
        cmdList.add("-map")
        cmdList.add("[vout]")
        
        if (audioIndices.isNotEmpty()) {
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
