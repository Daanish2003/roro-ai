import { fileURLToPath } from "node:url"
import { OnnxWrapper } from "./utils_vad.js"

export async function load_silero_vad(forceCPU: boolean) {
    const path = fileURLToPath(new URL('silero_vad.onnx', import.meta.url).href)

    const model = new OnnxWrapper(path, forceCPU, 16000)

    return model
}