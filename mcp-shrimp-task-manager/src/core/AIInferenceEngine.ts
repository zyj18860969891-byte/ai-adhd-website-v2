import OpenAI from "openai";

/**
 * AI Inference Engine for Shrimp Task Manager
 * Provides AI-powered reasoning and analysis capabilities
 */
export class AIInferenceEngine {
  private openai: OpenAI;
  private model: string;
  private temperature: number;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || "0.3");

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });

    this.model = model;
    this.temperature = temperature;
  }

  /**
   * Analyze a task and provide AI insights
   */
  async analyzeTask(
    taskDescription: string,
    context?: string
  ): Promise<string> {
    try {
      const prompt = `You are an expert ADHD-aware task analyst for a personal productivity system.

TASK ANALYSIS REQUIREMENTS:
1. TASK CLARITY ASSESSMENT:
   - Is the task clear and actionable?
   - Does it follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)?
   - What information is missing or ambiguous?

2. ADHD-SPECIFIC BREAKDOWN:
   - Break into smallest possible steps (micro-tasks)
   - Identify steps that match user's energy levels and focus patterns
   - Suggest optimal order based on cognitive load and momentum building
   - Flag steps that might trigger ADHD paralysis or overwhelm

3. INTELLIGENT CLASSIFICATION:
   - Category: Work/Personal/Learning/Administrative/Health/Relationships
   - Priority: Critical/High/Medium/Low (based on impact and urgency)
   - Effort Level: 5min/15min/30min/1hr/2hr+/Full Day
   - Energy Required: High/Low (physical/mental energy needed)

4. CONTEXT-AWARE DEPENDENCIES:
   - Identify blocking tasks and prerequisites
   - Map relationships to other tasks/projects
   - Consider time-based dependencies and optimal timing
   - Check for resource dependencies (tools, people, information)

5. ADHD-SPECIFIC RISK ASSESSMENT:
   - Potential blockers (procrastination triggers, complexity, boredom)
   - Sensory sensitivities or environmental factors
   - Executive function challenges (initiation, working memory, emotional regulation)
   - Past patterns that might affect completion

6. INTELLIGENT WORKFLOW SUGGESTIONS:
   - Optimal time of day based on energy patterns
   - Batch processing opportunities with similar tasks
   - Habit stacking possibilities with existing routines
   - Motivation strategies (gamification, accountability, rewards)
   - Focus techniques (Pomodoro, time blocking, body doubling)

7. SUCCESS OPTIMIZATION:
   - Quick wins to build momentum
   - Progress tracking suggestions
   - Motivation maintenance strategies
   - Adaptation strategies for setbacks

${context ? `Previous Context: ${context}\n` : ""}
Task Description: ${taskDescription}

Please provide a comprehensive analysis following the structure above. Focus on actionable insights that help the user succeed with ADHD.`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert ADHD-aware task analyst providing structured, actionable insights for personal productivity.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: this.temperature,
        max_tokens: 1500,
      });

      return response.choices[0].message.content || "Analysis completed.";
    } catch (error) {
      console.error("AI analysis failed:", error);
      return "AI analysis failed. Please try again or provide more details.";
    }
  }

  /**
   * Generate research insights for a topic
   */
  async generateResearch(
    topic: string,
    currentState: string,
    nextSteps: string
  ): Promise<string> {
    try {
      const prompt = `You are a research assistant helping with task exploration and learning.

Topic: ${topic}
Current Understanding: ${currentState}
Next Steps to Explore: ${nextSteps}

Generate a structured research response that:
1. Clarifies the topic
2. Identifies key concepts
3. Suggests investigation paths
4. Recommends resources or approaches
5. Provides actionable next steps`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.temperature,
        max_tokens: 1500,
      });

      return (
        response.choices[0]?.message?.content || "Research completed"
      );
    } catch (error) {
      console.error("Error in research generation:", error);
      throw error;
    }
  }

  /**
   * Verify task completion with AI assessment
   */
  async verifyTaskCompletion(
    taskSummary: string,
    score: number
  ): Promise<string> {
    try {
      const prompt = `As an AI task verifier, assess the completeness and quality of the following task completion:

Task Summary: ${taskSummary}
Self-Assessment Score: ${score}/100

Provide:
1. Assessment of the score appropriateness
2. What was done well
3. Potential gaps or improvements
4. Suggestions for related tasks
5. Learning points for future similar tasks`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.temperature,
        max_tokens: 800,
      });

      return (
        response.choices[0]?.message?.content || "Verification completed"
      );
    } catch (error) {
      console.error("Error in task verification:", error);
      throw error;
    }
  }

  /**
   * Reflect on task execution and learning
   */
  async reflectOnTask(
    taskDescription: string,
    executionNotes: string
  ): Promise<string> {
    try {
      const prompt = `You are a reflective coach helping someone learn from their task execution.

Task: ${taskDescription}
Execution Notes: ${executionNotes}

Provide thoughtful reflection on:
1. What went well
2. What was challenging
3. What was learned
4. How this applies to future tasks
5. Specific improvements for next time`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.temperature,
        max_tokens: 1000,
      });

      return (
        response.choices[0]?.message?.content || "Reflection completed"
      );
    } catch (error) {
      console.error("Error in task reflection:", error);
      throw error;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): { model: string; temperature: number } {
    return {
      model: this.model,
      temperature: this.temperature,
    };
  }
}

// Singleton instance
let inferenceEngineInstance: AIInferenceEngine | null = null;

/**
 * Get or create the AI Inference Engine instance
 */
export function getAIInferenceEngine(): AIInferenceEngine {
  if (!inferenceEngineInstance) {
    inferenceEngineInstance = new AIInferenceEngine();
  }
  return inferenceEngineInstance;
}
