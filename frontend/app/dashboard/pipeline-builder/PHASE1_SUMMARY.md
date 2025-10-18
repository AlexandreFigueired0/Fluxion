# Pipeline Builder Architecture Summary

## What We've Built (Phase 1 Visual Foundation)

### 1. **Data Model** (`types.ts`)
✅ Complete type definitions for GitHub Actions workflows:
- `Trigger` - What events start the workflow
- `Job` - Parallel execution units with steps
- `PipelineStep` - Individual commands/actions
- `MatrixStrategy` - Multi-configuration testing
- `Pipeline` - Complete workflow definition

### 2. **Components Built**

#### **TriggerEditor** (`TriggerEditor.tsx`)
- Collapsible panel above the canvas
- Select trigger event: push, pull_request, schedule, workflow_dispatch, release
- Dynamic fields based on event type:
  - **Push/PR**: Branch filters, path filters (monorepo support)
  - **Schedule**: Cron expression input with helper link
  - **Workflow Dispatch**: Manual trigger indicator
- Add/remove branches and path patterns

#### **JobNode** (`JobNode.tsx`)
- Represents a job visually on the canvas
- Shows:
  - Job name and runner (ubuntu-latest, etc.)
  - Step count and preview
  - Matrix indicator (if matrix strategy enabled)
  - Timeout indicator
  - Environment reference
- Handles React Flow connections for job dependencies

#### **StepEditor** (`StepEditor.tsx`)
- Subpanel for editing individual steps
- Type selector: Action vs Run Script
- For **Actions** (`uses: ...`):
  - Action reference input (e.g., actions/checkout@v4)
  - Action inputs (with:) key-value pairs
- For **Run** scripts:
  - Command textarea (supports multiline)
  - Shell selector (bash, sh, powershell, cmd)
- Common fields:
  - Working directory (monorepo support)
  - Environment variables
  - Conditional execution (`if:`)
  - Continue on error flag
  - Step timeout override

#### **JobConfigPanel** (`JobConfigPanel.tsx`)
- Expands when job is selected
- Sections (collapsible):
  - **Basic**: Name, runs-on, timeout, environment
  - **Steps**: List of steps, click to edit, add new steps
  - **Matrix**: OS, Node version, Python version
  - **Permissions**: Placeholder for Phase 2
- Delegates to StepEditor when step is selected

### 3. **Utilities** (`pipelineUtils.ts`)
- `createDefaultTrigger()` - Push to main
- `createCheckoutStep()` - Standard checkout action
- `createDefaultJob()` - Job with checkout step
- `createDefaultPipeline()` - Full pipeline scaffold
- `generateId()` - Unique ID generator

## Component Hierarchy

```
PipelineBuilder (next to refactor)
├── TriggerEditor (above canvas)
│   └── Trigger configuration
├── JobCanvas (React Flow)
│   ├── JobNode (draggable)
│   │   └── Connects to other jobs
│   └── CustomEdge (job dependencies)
└── JobConfigPanel (right sidebar when job selected)
    ├── Job basic config
    ├── StepEditor (opens when step selected)
    │   └── Step configuration
    ├── Matrix strategy
    └── Permissions (Phase 2)
```

## UI Flow

```
┌──────────────────────────────────────────┐
│ TriggerEditor (Collapsible Panel)        │
│ Event: [push ▼] Branches: [main] [+]    │
└──────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────┐
│ Job Canvas (React Flow)                  │
│                                          │
│  ┌─────────┐  ┌─────────┐               │
│  │ Build   │→ │  Test   │               │
│  │ ubuntu  │  │ ubuntu  │               │
│  │ 3 steps │  │ 2 steps │               │
│  └─────────┘  └─────────┘               │
└──────────────────────────────────────────┘
                      ↓
            [Right Sidebar]
           JobConfigPanel
         (when job selected)
                      ↓
           StepEditor
         (when step selected)
```

## What's Ready for Phase 2 (Components)

- ✅ All visual building blocks
- ✅ Data flows and state management patterns established
- ✅ Type safety across components
- ⏳ **Next**: Refactor PipelineBuilder to wire everything together
- ⏳ **Then**: YAML serialization and export

## State Management Pattern

Each component receives:
- `data` - Current configuration (immutable)
- `onUpdate(newData)` - Callback to update parent state
- `onDelete()` - Callback to remove this item
- `onClose()` - Callback to close panel

Parent (PipelineBuilder) will:
- Hold Pipeline state
- Pass down relevant Job/Step to child components
- Handle all updates and propagate back up

This makes it easy to:
- Save to localStorage
- Send to backend
- Implement undo/redo (just keep state snapshots)

## Files Created/Modified

### New Files
- `components/TriggerEditor.tsx` ✅
- `components/JobNode.tsx` ✅
- `components/StepEditor.tsx` ✅
- `components/JobConfigPanel.tsx` ✅
- `utils/pipelineUtils.ts` ✅

### Modified Files
- `types.ts` - Completely rewritten ✅
- `components/index.ts` - Updated exports ✅

### Existing (Not Yet Changed)
- `PipelineBuilder.tsx` - Will refactor next
- `PipelineNode.tsx` - Can keep for reference or remove
- `NodePalette.tsx` - Can refactor or remove
- `NodeConfigPanel.tsx` - Can replace with new JobConfigPanel
- `CustomEdge.tsx` - Can reuse, minor tweaks

## Next Step: PipelineBuilder Orchestrator

The main `PipelineBuilder` component needs to:

1. Initialize with `createDefaultPipeline()`
2. Hold the full `Pipeline` state
3. Render:
   - TriggerEditor at top
   - JobCanvas (React Flow) with JobNodes
   - JobConfigPanel on right (when job selected)
4. Handle:
   - Add/delete/update jobs
   - Update trigger
   - Sync state across components

This is the orchestrator that ties all the pieces together.

---

**Ready to build PipelineBuilder next?** Let me know if you want to understand anything better first!
