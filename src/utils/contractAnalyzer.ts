import { SuiClient } from "@mysten/sui/client";

const MAINNET_PACKAGE_ID = "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";

class ContractAnalyzer {
  private client: SuiClient;

  constructor() {
    this.client = new SuiClient({ 
      url: "https://fullnode.mainnet.sui.io:443" 
    });
  }

  async analyzeContract() {
    try {
      console.log("🔍 Analyzing mainnet contract:", MAINNET_PACKAGE_ID);

      // Get package info using getObject
      const packageInfo = await this.client.getObject({
        id: MAINNET_PACKAGE_ID,
        options: {
          showContent: true,
          showDisplay: true
        }
      });

      console.log("📦 Package Info:", {
        id: packageInfo.data?.objectId,
        type: packageInfo.data?.type
      });

      // Try to get modules using RPC call
      try {
        const modulesResponse = await fetch(
          `https://fullnode.mainnet.sui.io:443/v1/objects/${MAINNET_PACKAGE_ID}?showDisplay=true&showContent=true`
        );
        
        const modulesData = await modulesResponse.json();
        console.log("📋 Modules Data:", modulesData);

        // Extract modules from the response
        if (modulesData.data?.content?.modules) {
          console.log("\n🔍 Available Modules:");
          modulesData.data.content.modules.forEach((module: any) => {
            console.log(`  📋 Module: ${module.name}`);
            
            if (module.functions) {
              console.log("  Functions:");
              module.functions.forEach((func: any) => {
                console.log(`    🎯 ${func.name}`);
                console.log(`       Visibility: ${func.visibility}`);
                console.log(`       Parameters: ${func.parameters?.length || 0}`);
                console.log(`       Return: ${func.return?.length || 0}`);
                
                if (func.parameters) {
                  console.log("       Parameters:");
                  func.parameters.forEach((param: any, index: number) => {
                    console.log(`         ${index}: ${param}`);
                  });
                }
              });
            }

            if (module.structs) {
              console.log("  Structs:");
              module.structs.forEach((struct: any) => {
                console.log(`    🏗️ ${struct.name}`);
                if (struct.fields) {
                  struct.fields.forEach((field: any) => {
                    console.log(`       ${field.name}: ${field.type}`);
                  });
                }
              });
            }
          });
        }

      } catch (error) {
        console.error("Error fetching modules:", error);
      }

    } catch (error) {
      console.error("❌ Error analyzing contract:", error);
    }
  }

  async getFunctionSignature(moduleName: string, functionName: string) {
    try {
      // Use RPC call to get specific module
      const response = await fetch(
        `https://fullnode.mainnet.sui.io:443/v1/objects/${MAINNET_PACKAGE_ID}?showDisplay=true&showContent=true`
      );
      
      const data = await response.json();
      
      if (data.data?.content?.modules) {
        const moduleData = data.data.content.modules.find((m: any) => m.name === moduleName);
        
        if (moduleData) {
          const func = moduleData.functions?.find((f: any) => f.name === functionName);
          
          if (func) {
            console.log(`\n🎯 Function: ${moduleName}::${functionName}`);
            console.log(`Visibility: ${func.visibility}`);
            console.log(`Parameters: ${func.parameters?.join(', ') || 'None'}`);
            console.log(`Return: ${func.return?.join(', ') || 'None'}`);
            
            return func;
          } else {
            console.log(`Function ${functionName} not found in module ${moduleName}`);
            return null;
          }
        } else {
          console.log(`Module ${moduleName} not found`);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error getting function signature:", error);
      return null;
    }
  }
}

export { ContractAnalyzer, MAINNET_PACKAGE_ID }; 