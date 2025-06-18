import {z} from 'zod';
//import {zodToJsonSchema} from "zod-to-json-schema";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {ListToolsRequestSchema, CallToolRequestSchema, ToolSchema} from "@modelcontextprotocol/sdk/types.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {CodeAnalyzer, CodeAnalyzerConfig, OutputFormat} from '@salesforce/code-analyzer-core';
import * as RegexEnginePlugin from '@salesforce/code-analyzer-regex-engine';

// Create server instance
const server = new Server({
    name: "code-analyzer",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
})

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "run-rules",
                description:
                    "Execute the Salesforce Code Analyzer tool against a single file. Use this tool to run " +
                    "all of the recommended Salesforce Code Analyzer rules. Returns either a JSON containing the violations " +
                    "found in the target file, or a string containing a detailed explanation for why analysis failed to complete.",
                inputSchema: {
                    type: "object",
                    properties: {
                        target: {
                            type: "string",
                            description: "Relative path to the file being targeted for Code Analysis."
                        },
                        workspace: {
                            type: "array",
                            items: { type: "string" },
                            description: "Optional array of folders necessary to conduct comprehensive Code Analysis. " +
                                "If this input is provided, then the target file MUST be contained within one of the folders " +
                                "specified by this parameter."
                        }
                    },
                    required: []
                }
            }
        ]
    }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
        case 'run-rules':

    }
    if (request.params.name === 'run-rules') {

    }
});

server2.setRequestHandler(CallToolRequestSchema, async (request) => {
    const codeAnalyzer: CodeAnalyzer = new CodeAnalyzer(CodeAnalyzerConfig.withDefaults());
    await codeAnalyzer.addEnginePlugin(RegexEnginePlugin.createEnginePlugin());

    if (request.params.name === 'get-config') {
        return {
            content: [
                {
                    type: "text",
                    text: "beep boop bop"
                }
            ]
        }
    } else {
        throw new Error('asdfasdfasdf');
    }
})
 */

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
    "run the specified rules against the specified files. Rule execution might take several minutes, and you should wait until the transaction finishes instead of giving up.",
    {
        selectors: z.array(z.string()),
        workspace: z.array(z.string())
    },
    async ({selectors, workspace}) => {
        return new Promise((res) => {
            setTimeout(async () => {

                const codeAnalyzer: CodeAnalyzer = new CodeAnalyzer(CodeAnalyzerConfig.withDefaults());
                await codeAnalyzer.addEnginePlugin(RegexEnginePlugin.createEnginePlugin());
                const selection = await codeAnalyzer.selectRules(selectors);
                const workspaceObj = await codeAnalyzer.createWorkspace(workspace);
                const runResults = await codeAnalyzer.run(selection, {
                    workspace: workspaceObj
                });
                res({
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(runResults.toFormattedOutput(OutputFormat.JSON))
                        }
                    ]
                })
            }, 1000)
        })
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
    //await server2.connect(transport);
    console.error("Code-Analyzer MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});