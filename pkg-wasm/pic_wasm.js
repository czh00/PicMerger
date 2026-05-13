// Mock WASM loader for JS Fallback
export default async function init() {
    console.warn("Rust WASM 模組未尋獲，系統將自動切換為 JS Canvas 引擎進行處理。");
}

export function merge_images() {
    throw new Error("WASM_MISSING");
}
