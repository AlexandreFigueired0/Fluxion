# Visual Pipeline Builder

A drag-and-drop visual editor for creating GitHub Actions CI/CD workflows.

## Features

- **Visual Node-Based Editor**: Drag and drop nodes to build your pipeline
- **Multiple Node Types**:
  - **Trigger**: Define when the workflow runs (push, pull request, release, schedule, manual)
  - **Checkout**: Checkout code from repository
  - **Setup**: Configure language environments (Node.js, Python, Go, Java, etc.)
  - **Build**: Run build commands
  - **Test**: Execute test suites
  - **Deploy**: Deploy to various platforms
  - **Custom**: Create custom steps with actions or shell commands

- **Real-time YAML Generation**: Generate GitHub Actions YAML from your visual pipeline
- **Export & Download**: Save workflows as `.yml` files
- **Quick Start Templates**: Start with pre-built common pipelines
- **Interactive Configuration**: Click nodes to configure their properties

## Usage

### Creating a Pipeline

1. **Add Nodes**: 
   - Drag nodes from the left palette onto the canvas
   - Or click a node type to add it to the canvas

2. **Connect Nodes**: 
   - Click and drag from the bottom handle of one node to the top handle of another
   - This defines the execution order

3. **Configure Nodes**: 
   - Click any node to open the configuration panel on the right
   - Set properties like commands, versions, branches, etc.

4. **Generate YAML**: 
   - Click "Preview" to see the generated GitHub Actions workflow
   - Click "Export" to download the `.yml` file
   - Click "Copy to Clipboard" to copy the YAML

### Node Types

#### Trigger
Defines when the workflow runs:
- **Push**: Runs on git push to specified branches
- **Pull Request**: Runs on pull requests
- **Release**: Runs when releases are published
- **Schedule**: Runs on a cron schedule
- **Manual**: Manually triggered workflows

#### Checkout
Checks out your repository code. Uses `actions/checkout@v4`.

#### Setup
Sets up language runtimes:
- Node.js, Python, Go, Java, Ruby, Rust, .NET
- Configure version and caching

#### Build
Runs build commands like:
- `npm run build`
- `go build`
- `mvn package`

#### Test
Executes test commands:
- `npm test`
- `pytest`
- `go test`

#### Deploy
Deploy to platforms:
- Docker
- Vercel
- AWS
- Google Cloud
- Azure
- Custom deployment scripts

#### Custom
Create custom steps using:
- GitHub Actions (`uses:`)
- Shell commands (`run:`)
- Environment variables

### Quick Start

Click the "Basic Pipeline" button to create a starter pipeline with:
1. Trigger on push to main
2. Checkout code
3. Setup Node.js
4. Build project
5. Run tests

### Tips

- **Execution Order**: Nodes are executed in the order they're connected (top to bottom)
- **Multiple Paths**: You can create parallel execution paths by connecting multiple nodes to the same parent
- **Validation**: The YAML generator validates node connections before generating output
- **Best Practices**: Start with a Trigger node, then Checkout, then Setup, then your build/test/deploy steps

## Example Pipeline

```
Trigger (on push)
    ↓
Checkout Code
    ↓
Setup Node.js 18.x
    ↓
Build (npm run build)
    ↓
Run Tests (npm test)
    ↓
Deploy to Production
```

## Generated YAML Example

```yaml
name: Generated Pipeline
on:
  push:
    branches:
      - main
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: npm
    - name: Build
      run: npm run build
    - name: Run Tests
      run: npm test
```

## Keyboard Shortcuts

- **Delete**: Remove selected nodes and edges
- **Ctrl/Cmd + Z**: Undo (browser default)
- **Mouse Wheel**: Zoom in/out
- **Click + Drag on Canvas**: Pan the view

## Integration

The pipeline builder integrates with Fluxion's AI-powered pipeline generation:
- Use the visual builder for precise control
- Or use AI generation for quick setup
- Combine both: generate with AI, refine visually
