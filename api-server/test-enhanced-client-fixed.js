import { spawn } from 'child_process';

async function testEnhancedClient() {
  console.log('Testing enhanced StdioMCPClient...');

  try {
    // Test import
    const { default: StdioMCPClient } = await import('./src/stdio-mcp-client.js');
    console.log('✅ StdioMCPClient import successful');

    // Test timeout configuration
    console.log('Timeout configuration:');
    console.log('   CONNECTION:', StdioMCPClient.TIMEOUT_CONFIG.CONNECTION);
    console.log('   REQUEST:', StdioMCPClient.TIMEOUT_CONFIG.REQUEST);
    console.log('   TOOL_CALL:', StdioMCPClient.TIMEOUT_CONFIG.TOOL_CALL);
    console.log('   HEALTH_CHECK:', StdioMCPClient.TIMEOUT_CONFIG.HEALTH_CHECK);
    console.log('   RECONNECT:', StdioMCPClient.TIMEOUT_CONFIG.RECONNECT);

    // Test dynamic timeout calculation
    const client = new StdioMCPClient('./simple-mcp-client.js');
    console.log('\nDynamic timeout calculation:');
    for (let i = 1; i <= 3; i++) {
      const timeout = client.calculateTimeout('TOOL_CALL', i);
      console.log('   Attempt ' + i + ': ' + timeout + 'ms');
    }

    console.log('\n✅ Enhanced StdioMCPClient test completed');

  } catch (error) {
    console.log('❌ Test failed: ' + error.message);
    console.log('Error stack:', error.stack);
  }
}

testEnhancedClient();