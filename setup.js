export let device;

try {
    if (!navigator.gpu) {
        throw new Error("WebGPU is not supported by this browser.");
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("Unable to get a GPU adapter.");
    }
    device = await adapter.requestDevice();
} catch (error) {
    console.error("WebGPU initialization failed:", error.message);
    alert("Failed to initialize WebGPU. Please check browser compatibility or try a different device.");
    throw error;
}

export const canvas = document.createElement('canvas');
document.body.append(canvas);
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

export const format = navigator.gpu.getPreferredCanvasFormat();
export const context = canvas.getContext('webgpu');
const alphamode = "premultiplied";
context.configure({device, format, alphamode});
