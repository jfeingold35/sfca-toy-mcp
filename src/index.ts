import {z} from 'zod';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {CodeAnalyzer, CodeAnalyzerConfig, OutputFormat} from '@salesforce/code-analyzer-core';
import * as RegexEnginePlugin from '@salesforce/code-analyzer-regex-engine';

// Create server instance
const server = new McpServer({
    name: "code-analyzer",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});


server.tool(
    "get-rules",
    "Get rules available for execution by Code Analyzer",
    {},
    async () => {

        const codeAnalyzer: CodeAnalyzer = new CodeAnalyzer(CodeAnalyzerConfig.withDefaults());
        await codeAnalyzer.addEnginePlugin(RegexEnginePlugin.createEnginePlugin());
        const rules = await codeAnalyzer.selectRules(['Recommended']);
        const ruleJsons = rules.toFormattedOutput(OutputFormat.JSON)

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(ruleJsons)
                }
            ]
        }
    }
)

server.tool(
    "run-rules",
    "run the specified rules",
    {
        selectors: z.array(z.string()),
        workspace: z.array(z.string())
    },
    async ({selectors, workspace}) => {
        const codeAnalyzer: CodeAnalyzer = new CodeAnalyzer(CodeAnalyzerConfig.withDefaults());
        await codeAnalyzer.addEnginePlugin(RegexEnginePlugin.createEnginePlugin());
        const selection = await codeAnalyzer.selectRules(selectors);
        const workspaceObj = await codeAnalyzer.createWorkspace(workspace);
        const runResults = await codeAnalyzer.run(selection, {
            workspace: workspaceObj
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(runResults.toFormattedOutput(OutputFormat.JSON))
                }
            ]
        }
    }
)

server.tool(
    "get-node-info",
    "Get information about nodejs",
    {},
    async () => {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({node_exe: process.execPath, version: process.version, node_arg: process.argv[0]})
                }
            ]
        }
    }

)


async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Code-Analyzer MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});