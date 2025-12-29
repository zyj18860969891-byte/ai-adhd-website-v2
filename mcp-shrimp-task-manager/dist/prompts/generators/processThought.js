import { loadPrompt, generatePrompt, loadPromptFromTemplate, } from '../loader.js';
export async function getProcessThoughtPrompt(param) {
    let nextThoughtNeeded = "";
    if (param.nextThoughtNeeded) {
        nextThoughtNeeded = await loadPromptFromTemplate("processThought/moreThought.md");
    }
    else {
        nextThoughtNeeded = await loadPromptFromTemplate("processThought/complatedThought.md");
    }
    const indexTemplate = await loadPromptFromTemplate("processThought/index.md");
    const prompt = generatePrompt(indexTemplate, {
        thought: param.thought,
        thoughtNumber: param.thoughtNumber,
        totalThoughts: param.totalThoughts,
        stage: param.stage,
        tags: param.tags.join(", ") || "no tags",
        axioms_used: param.axioms_used.join(", ") || "no axioms used",
        assumptions_challenged: param.assumptions_challenged.join(", ") || "no assumptions challenged",
        nextThoughtNeeded,
    });
    return loadPrompt(prompt, "PROCESS_THOUGHT");
}
//# sourceMappingURL=processThought.js.map