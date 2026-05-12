package com.czh.picmerger.utils

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import androidx.core.content.FileProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.OutputStream

object StorageHelper {

    fun saveBitmapToGalleryAsync(context: Context, bitmap: Bitmap, onComplete: (Boolean, String) -> Unit) {
        CoroutineScope(Dispatchers.IO).launch {
            val filename = "PicMerger_${System.currentTimeMillis()}.png"
            var fos: OutputStream? = null
            var imageUri: Uri? = null
            var success = false
            var msg = ""

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    context.contentResolver?.also { resolver ->
                        val contentValues = ContentValues().apply {
                            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                            put(MediaStore.MediaColumns.MIME_TYPE, "image/png")
                            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/PicMerger")
                        }
                        imageUri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
                        fos = imageUri?.let { resolver.openOutputStream(it) }
                    }
                } else {
                    val imagesDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "PicMerger")
                    if (!imagesDir.exists()) imagesDir.mkdirs()
                    val image = File(imagesDir, filename)
                    imageUri = Uri.fromFile(image)
                    fos = FileOutputStream(image)
                }

                fos?.use {
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
                    success = true
                    msg = "圖片已儲存至相簿！"
                } ?: run {
                    msg = "無法建立檔案"
                }
            } catch (e: Exception) {
                msg = "儲存失敗: ${e.message}"
            }
            
            withContext(Dispatchers.Main) {
                Toast.makeText(context, msg, if (success) Toast.LENGTH_SHORT else Toast.LENGTH_LONG).show()
                onComplete(success, msg)
            }
        }
    }
    
    fun saveVideoToGalleryAsync(context: Context, file: File, onComplete: (Boolean, String) -> Unit) {
        CoroutineScope(Dispatchers.IO).launch {
            val filename = "PicMerger_${System.currentTimeMillis()}.mp4"
            var fos: OutputStream? = null
            var videoUri: Uri? = null
            var success = false
            var msg = ""

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    context.contentResolver?.also { resolver ->
                        val contentValues = ContentValues().apply {
                            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                            put(MediaStore.MediaColumns.MIME_TYPE, "video/mp4")
                            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/PicMerger")
                        }
                        videoUri = resolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues)
                        fos = videoUri?.let { resolver.openOutputStream(it) }
                    }
                } else {
                    val moviesDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "PicMerger")
                    if (!moviesDir.exists()) moviesDir.mkdirs()
                    val destFile = File(moviesDir, filename)
                    videoUri = Uri.fromFile(destFile)
                    fos = FileOutputStream(destFile)
                }

                fos?.use { output ->
                    FileInputStream(file).use { input ->
                        input.copyTo(output)
                    }
                    success = true
                    msg = "影片已儲存至相簿！"
                } ?: run {
                    msg = "無法建立檔案"
                }
            } catch (e: Exception) {
                msg = "儲存影片失敗: ${e.message}"
            }
            
            withContext(Dispatchers.Main) {
                Toast.makeText(context, msg, if (success) Toast.LENGTH_SHORT else Toast.LENGTH_LONG).show()
                onComplete(success, msg)
            }
        }
    }

    fun shareBitmap(context: Context, bitmap: Bitmap, onComplete: () -> Unit) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val cachePath = File(context.cacheDir, "images")
                cachePath.mkdirs()
                val file = File(cachePath, "share_temp.png")
                val stream = FileOutputStream(file)
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
                stream.close()

                val contentUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)

                withContext(Dispatchers.Main) {
                    if (contentUri != null) {
                        val shareIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                            putExtra(Intent.EXTRA_STREAM, contentUri)
                            type = "image/png"
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "分享圖片至..."))
                    }
                    onComplete()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "分享失敗: ${e.message}", Toast.LENGTH_LONG).show()
                    onComplete()
                }
            }
        }
    }
    
    fun shareVideo(context: Context, file: File, onComplete: () -> Unit) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val contentUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
                withContext(Dispatchers.Main) {
                    if (contentUri != null) {
                        val shareIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                            putExtra(Intent.EXTRA_STREAM, contentUri)
                            type = "video/mp4"
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "分享影片至..."))
                    }
                    onComplete()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "分享失敗: ${e.message}", Toast.LENGTH_LONG).show()
                    onComplete()
                }
            }
        }
    }
}
