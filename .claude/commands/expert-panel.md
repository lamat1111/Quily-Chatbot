---
name: expert-panel
description: Launch three parallel expert agents to analyze a task for best practices, over-engineering, and optimality
argument-hint: "<task-file-or-description>"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

<objective>
Launch three parallel expert agents to independently analyze a task or implementation. Each expert brings a different perspective:

1. **Architecture Expert** — System design, patterns, scalability, maintainability
2. **Implementation Expert** — Code quality, best practices, performance, security
3. **Pragmatism Expert** — Over-engineering detection, simplicity, YAGNI, actual value delivered

Each agent scores the task (1-10) with detailed findings. The orchestrator synthesizes a final consolidated report.
</objective>

<context>
Target: $ARGUMENTS (task file path, implementation description, or feature name)

**When to use:**
- Before implementing a complex feature (validate approach)
- After implementing (review for issues)
- When refactoring (ensure changes are worthwhile)
- When suspicious of over-engineering
- For learning/improvement on completed work
</context>

<process>

## 0. Check for Arguments

**If $ARGUMENTS is empty or not provided:**

Use AskUserQuestion to prompt the user:

```
Question: "What would you like the expert panel to analyze?"
Header: "Target"
Options:
  - label: "A task file"
    description: "Analyze a task definition from .agents/tasks/ or similar"
  - label: "A source file/directory"
    description: "Analyze implementation code (e.g., src/components/Chat.tsx)"
  - label: "Describe a feature"
    description: "Describe what you want analyzed and I'll review it"
```

Based on user selection:
- **Task file:** Ask for the file path or list recent task files to choose from
- **Source file/directory:** Ask for the path to analyze
- **Describe:** Ask user to describe the feature/task/implementation

**If $ARGUMENTS is provided:** Continue to Step 1.

## 1. Parse Input

Determine what to analyze:

```bash
# Check if argument is a file path
if [ -f "$ARGUMENTS" ]; then
  ANALYSIS_TYPE="file"
  TARGET_PATH="$ARGUMENTS"
elif [ -d "$ARGUMENTS" ]; then
  ANALYSIS_TYPE="directory"
  TARGET_PATH="$ARGUMENTS"
else
  ANALYSIS_TYPE="description"
  TARGET_DESC="$ARGUMENTS"
fi
```

**If file/directory:** Read contents for analysis context
**If description:** Use the description directly as the analysis target

## 2. Gather Context

For file-based analysis, gather relevant context:

```bash
# If analyzing a file, get surrounding context
if [ "$ANALYSIS_TYPE" = "file" ] || [ "$ANALYSIS_TYPE" = "directory" ]; then
  # Find related files
  RELATED_FILES=$(grep -r "import.*from" "$TARGET_PATH" 2>/dev/null | head -10)

  # Check for tests
  TEST_FILES=$(ls *test* *spec* 2>/dev/null | head -5)

  # Get git history if available
  GIT_HISTORY=$(git log --oneline -5 -- "$TARGET_PATH" 2>/dev/null)
fi
```

For task-file analysis (e.g., `.agents/tasks/*.md`), read the task content:

```bash
cat "$TARGET_PATH"
```

## 3. Display Analysis Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 EXPERT PANEL ► ANALYZING {target}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Spawning 3 expert agents in parallel...
  • Architecture Expert — patterns, scalability, design
  • Implementation Expert — code quality, best practices
  • Pragmatism Expert — over-engineering, simplicity
```

## 4. Spawn Three Expert Agents in Parallel

**CRITICAL:** Launch ALL THREE agents in a SINGLE message with multiple Task tool calls to run in parallel.

### Expert 1: Architecture Expert

```
Task(
  prompt="You are an ARCHITECTURE EXPERT on a panel analyzing a task/implementation.

YOUR FOCUS (exclusively):
- System design patterns used/needed
- Component relationships and coupling
- Scalability considerations
- Maintainability and extensibility
- Separation of concerns
- Dependency management

SCORING RUBRIC (1-10):
+2: Clear separation of concerns
+2: Appropriate design patterns for the problem
+1: Low coupling between components
+1: High cohesion within components
+1: Extensibility built-in naturally
+1: Scales horizontally/vertically as needed
+1: Clear data flow
+1: Well-defined interfaces/contracts

-2: Tight coupling between unrelated components
-2: God objects or kitchen-sink modules
-1: Missing abstraction layers
-1: Circular dependencies
-1: Mixed concerns in single component
-1: No clear data flow
-1: Scaling bottlenecks baked in

<analysis_target>
Type: {analysis_type}
Target: {target_path or target_desc}

{file contents or description}
{related context}
</analysis_target>

Return your analysis in this format:

## Architecture Expert Analysis

**Score: X/10**
**One-Line Summary:** {brief assessment}

### Strengths
- {strength with explanation}

### Concerns
- {concern with explanation and impact}

### Scalability Assessment
{analysis}

### Maintainability Assessment
{analysis}

### Recommendations
1. {specific actionable suggestion}

### Score Justification
{explain your score}",
  subagent_type="general-purpose",
  model="sonnet",
  description="Architecture Expert analysis"
)
```

### Expert 2: Implementation Expert

```
Task(
  prompt="You are an IMPLEMENTATION EXPERT on a panel analyzing a task/implementation.

YOUR FOCUS (exclusively):
- Code quality and readability
- Best practices and conventions
- Performance considerations
- Security implications
- Error handling and edge cases
- Type safety and data validation

SCORING RUBRIC (1-10):
+2: Clean, readable code with clear intent
+1: Consistent style and naming conventions
+1: Proper error handling for all failure modes
+1: Input validation at boundaries
+1: No obvious security vulnerabilities
+1: Performant algorithms/data structures
+1: Type-safe with proper contracts
+1: Testable design
+1: No dead code or unused imports

-2: Security vulnerabilities (injection, XSS, etc.)
-2: Missing error handling for critical paths
-1: Inconsistent style/naming
-1: Poor readability (magic numbers, unclear names)
-1: Performance anti-patterns (N+1 queries, blocking I/O)
-1: Missing input validation
-1: Untestable code
-1: Dead code or unused dependencies

<analysis_target>
Type: {analysis_type}
Target: {target_path or target_desc}

{file contents or description}
{related context}
</analysis_target>

Return your analysis in this format:

## Implementation Expert Analysis

**Score: X/10**
**One-Line Summary:** {brief assessment}

### Strengths
- {strength with code reference if applicable}

### Concerns
- {concern with explanation and code reference}

### Security Assessment
{analysis — vulnerabilities or clean bill}

### Performance Assessment
{analysis}

### Error Handling Assessment
{analysis}

### Recommendations
1. {specific code-level suggestion}

### Score Justification
{explain your score}",
  subagent_type="general-purpose",
  model="sonnet",
  description="Implementation Expert analysis"
)
```

### Expert 3: Pragmatism Expert

```
Task(
  prompt="You are a PRAGMATISM EXPERT on a panel analyzing a task/implementation.

YOUR FOCUS (exclusively):
- Over-engineering detection
- Unnecessary complexity
- YAGNI (You Aren't Gonna Need It) violations
- Premature optimization/abstraction
- Actual value delivered vs. complexity cost
- Configuration/options that will never be used
- Layers of indirection that don't add value

YOUR SUPERPOWER: Asking 'But do we actually need this?'

SCORING RUBRIC (1-10):
+2: Does exactly what's needed, no more
+2: Simple solutions to simple problems
+1: Abstractions only where proven necessary
+1: Configuration limited to actual use cases
+1: Direct code paths (no unnecessary indirection)
+1: Features that are actually used
+1: Obvious code over clever code
+1: Appropriate tool/library choices (not overkill)

-2: Abstractions solving problems that don't exist
-2: 'Extensibility' for scenarios that will never happen
-1: Configuration options no one will change
-1: Factory/builder/strategy patterns for single implementations
-1: Premature optimization (complexity without benchmarks)
-1: Wrapper classes that just delegate
-1: Generic solutions for specific problems
-1: 'Just in case' code

OVER-ENGINEERING SMELLS:
- Interface with only one implementation
- Factory that creates one type
- Plugin systems with no plugins
- Event systems with one listener
- Manager/Handler/Service suffixes hiding simple functions
- Dependency injection for everything

<analysis_target>
Type: {analysis_type}
Target: {target_path or target_desc}

{file contents or description}
{related context}
</analysis_target>

Return your analysis in this format:

## Pragmatism Expert Analysis

**Score: X/10**
**One-Line Summary:** {complexity vs value assessment}

### Problem vs. Solution Complexity
**Actual Problem:** {what needs to be solved}
**Solution Complexity:** {how complex is the current solution}
**Appropriate Complexity:** {how complex should it be}

### Strengths
- {where simplicity was maintained}

### Over-Engineering Detected
- {what's over-engineered, why unnecessary}
  - Simpler alternative: {what to do instead}

### YAGNI Violations
{features/code that exist 'just in case'}

### Unnecessary Complexity
{layers, abstractions, patterns that don't earn their keep}

### Recommendations
1. {what to simplify and how}

### Score Justification
{ratio of necessary to unnecessary complexity}

### The Simple Alternative
{if rewritten with maximum pragmatism, what would it look like?}",
  subagent_type="general-purpose",
  model="sonnet",
  description="Pragmatism Expert analysis"
)
```

## 5. Collect Results

Wait for all three agents to complete. Parse their structured outputs:

- Architecture score and findings
- Implementation score and findings
- Pragmatism score and findings

## 6. Synthesize Final Report

Combine all three expert analyses into a consolidated report.

**Calculate composite score:**
```
composite_score = (arch_score + impl_score + prag_score) / 3
```

**Identify consensus and disagreements:**
- Issues flagged by 2+ experts = HIGH priority
- Issues flagged by 1 expert = MEDIUM priority
- Contradictions between experts = note for user decision

</process>

<output>

Display the final consolidated report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 EXPERT PANEL ► ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Target: {target}

## Scores

| Expert | Score | Summary |
|--------|-------|---------|
| Architecture | {arch_score}/10 | {one-line summary} |
| Implementation | {impl_score}/10 | {one-line summary} |
| Pragmatism | {prag_score}/10 | {one-line summary} |
| **Composite** | **{avg}/10** | |

## Consensus Issues (Flagged by 2+ Experts)

{List issues that multiple experts agree on — these are high priority}

## Expert-Specific Findings

### Architecture Expert

**Strengths:**
{bullet points}

**Concerns:**
{bullet points}

**Recommendations:**
{bullet points}

### Implementation Expert

**Strengths:**
{bullet points}

**Concerns:**
{bullet points}

**Recommendations:**
{bullet points}

### Pragmatism Expert

**Strengths:**
{bullet points}

**Concerns:**
{bullet points}

**Recommendations:**
{bullet points}

## Disagreements

{Note where experts have conflicting views, if any}

## Final Verdict

{Overall assessment: proceed, revise, or rethink}
{Key action items}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</output>

<success_criteria>
- [ ] Input parsed (file, directory, or description)
- [ ] Context gathered for analysis
- [ ] All 3 expert agents spawned IN PARALLEL (single message)
- [ ] Each expert returns structured analysis with score
- [ ] Consensus issues identified (2+ experts agree)
- [ ] Disagreements noted
- [ ] Composite score calculated
- [ ] Final consolidated report presented to user
</success_criteria>

<notes>
- Agents run in parallel for speed
- Each expert has a distinct perspective to avoid groupthink
- Scoring enables objective comparison
- Consensus detection highlights high-priority issues
- Pragmatism expert specifically looks for over-engineering
</notes>
