// src/utils/deployment-rules.ts

interface Hardware {
  gpu?: string;
  vram_gb?: number;
  ram_gb?: number;
  cpu_cores?: number;
}

interface DeploymentOption {
  method: string;
  vram_required: number;
  feasible: boolean;
  performance: string;
  tools: string[];
  instructions: string;
}

export function analyzeDeployment(model: any, hardware: Hardware): any {
  const params = extractParamSize(model.params);
  if (!params) {
    return {
      feasible: false,
      reason: 'Unable to determine model size',
      recommendations: []
    };
  }

  const userVRAM = hardware.vram_gb || 0;
  const options: DeploymentOption[] = [];

  // FP16 Full Precision
  const fp16VRAM = params * 2;
  options.push({
    method: 'FP16 Full Precision',
    vram_required: fp16VRAM,
    feasible: fp16VRAM <= userVRAM,
    performance: 'Best quality, no degradation',
    tools: ['vLLM', 'text-generation-webui', 'transformers'],
    instructions: `Load model with torch_dtype=float16`
  });

  // INT8 Quantization
  const int8VRAM = params * 1;
  options.push({
    method: 'INT8 Quantization',
    vram_required: int8VRAM,
    feasible: int8VRAM <= userVRAM,
    performance: 'Minimal quality loss (<2%), 50% memory savings',
    tools: ['llama.cpp', 'bitsandbytes', 'GPTQ'],
    instructions: `Use load_in_8bit=True or GGUF Q8_0 format`
  });

  // INT4 Quantization
  const int4VRAM = params * 0.5;
  options.push({
    method: 'INT4 Quantization (GGUF Q4_K_M)',
    vram_required: int4VRAM,
    feasible: int4VRAM <= userVRAM,
    performance: 'Small quality loss (3-5%), 75% memory savings',
    tools: ['llama.cpp', 'GPTQ', 'AWQ'],
    instructions: `Download GGUF Q4_K_M version or use AWQ`
  });

  // INT3 Quantization
  const int3VRAM = params * 0.375;
  options.push({
    method: 'INT3 Quantization (GGUF Q3_K_M)',
    vram_required: int3VRAM,
    feasible: int3VRAM <= userVRAM,
    performance: 'Noticeable quality loss (5-10%), extreme memory savings',
    tools: ['llama.cpp'],
    instructions: `Download GGUF Q3_K_M version for resource-constrained deployment`
  });

  // Find feasible options
  const feasible = options.filter(o => o.feasible);
  const recommended = feasible.length > 0 ? feasible[0] : null;

  // Alternative: smaller model
  let smallerModelSuggestion = null;
  if (feasible.length === 0) {
    if (params >= 70) smallerModelSuggestion = '13B-30B range';
    else if (params >= 30) smallerModelSuggestion = '7B-13B range';
    else if (params >= 13) smallerModelSuggestion = '3B-7B range';
    else smallerModelSuggestion = '1B-3B range';
  }

  return {
    feasible: feasible.length > 0,
    reason: feasible.length > 0
      ? `${feasible.length} deployment option(s) available`
      : `Model requires ${fp16VRAM}GB VRAM (FP16), you have ${userVRAM}GB`,
    hardware_summary: {
      provided: hardware,
      model_size: `${params}B parameters`
    },
    recommended_option: recommended,
    all_options: options,
    alternative_suggestion: smallerModelSuggestion ? {
      reason: 'Consider using a smaller model',
      suggested_range: smallerModelSuggestion
    } : null
  };
}

function extractParamSize(params: string | null): number | null {
  if (!params) return null;
  const match = params.match(/(\d+\.?\d*)/);
  if (!match) return null;
  return parseFloat(match[1]);
}
