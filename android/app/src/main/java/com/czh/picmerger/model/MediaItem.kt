package com.czh.picmerger.model

import android.graphics.Bitmap
import android.net.Uri

data class MediaItem(
    val id: String = java.util.UUID.randomUUID().toString(),
    val uri: Uri,
    val name: String,
    val width: Int,
    val height: Int,
    val isVideo: Boolean = false,
    @Transient var cachedBitmap: Bitmap? = null
)
