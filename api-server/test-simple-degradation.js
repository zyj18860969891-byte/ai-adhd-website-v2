import { spawn } from 'child_process';

async function testSimpleDegradation() {
  console.log('Testing simple degradation features...');

  try {
    // Test import
    const { default: StdioMCPClient } = await import('./src/stdio-mcp-client.js');
    console.log('✅ StdioMCPClient import successful');

    // Create client
    const client = new StdioMCPClient('./simple-mcp-client.js');
    
    // Test error messages
    console.log('\n1. Testing user-friendly error messages:');
    const errorDetails = client.generateDetailedError('TIMEOUT', '请求超时，请稍后重试');
    console.log('   Error details generated successfully');
    
    // Test offline mode
    console.log('\n2. Testing offline mode:');
    client.setOfflineMode(true);
    console.log('   Offline mode enabled');
    
    // Test degradation
    console.log('\n3. Testing degradation mechanism:');
    const shouldDegrade = client.shouldDegrade();
    console.log(`   Should degrade: ${shouldDegrade}`);
    
    // Reset offline mode
    client.setOfflineMode(false);
    console.log('\n✅ Offline mode disabled');
    
    console.log('\n✅ Simple degradation test completed');

  } catch (error) {
    console.log('❌ Test failed: ' + error.message);
    console.log('Error stack:', error.stack);
  }
}

testSimpleDegradation();