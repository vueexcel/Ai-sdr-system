require('dotenv').config();
const ProspectPipeline = require('./src/services/prospectPipeline');
const DatabaseService = require('./src/database/database');

async function testCompleteIntegration() {
  console.log('🚀 Testing Complete Integration: Apollo → Database');
  
  try {
    // Step 1: Check initial database state
    console.log('\n📊 Step 1: Initial Database State');
    const initialStats = await DatabaseService.getProspectStats();
    console.log(`Initial prospects count: ${initialStats.totalProspects}`);

    // Step 2: Test pipeline with real Apollo data
    console.log('\n🔄 Step 2: Running Apollo → Database Pipeline');
    const pipeline = new ProspectPipeline();
    const result = await pipeline.collectAndStoreLegalProspects();

    if (result.success) {
      console.log('\n✅ Pipeline completed successfully!');
      
      // Step 3: Verify data was stored
      console.log('\n📊 Step 3: Verifying Database Storage');
      const finalStats = await DatabaseService.getProspectStats();
      console.log(`Final prospects count: ${finalStats.totalProspects}`);
      console.log(`New prospects added: ${finalStats.totalProspects - initialStats.totalProspects}`);

      if (finalStats.totalProspects > initialStats.totalProspects) {
        console.log('\n👥 Newly Added Prospects:');
        const newProspects = await DatabaseService.getProspectsByStatus('NEW', 5);
        
        newProspects.forEach((prospect, index) => {
          console.log(`\n${index + 1}. ${prospect.firstName} ${prospect.lastName}`);
          console.log(`   ID: ${prospect.id}`);
          console.log(`   Company: ${prospect.company || 'N/A'}`);
          console.log(`   Title: ${prospect.title || 'N/A'}`);
          console.log(`   Email: ${prospect.email || 'N/A'}`);
          console.log(`   LinkedIn: ${prospect.linkedinUrl ? '✅' : '❌'}`);
          console.log(`   Status: ${prospect.status}`);
          console.log(`   Created: ${prospect.createdAt}`);
        });

        // Step 4: Test database operations
        console.log('\n🔧 Step 4: Testing Database Operations');
        
        if (newProspects.length > 0) {
          const testProspect = newProspects[0];
          
          // Test status update
          console.log(`\n🔄 Testing status update for ${testProspect.firstName} ${testProspect.lastName}`);
          const updatedProspect = await DatabaseService.updateProspectStatus(
            testProspect.id, 
            'CONNECTED',
            { connectionDate: new Date() }
          );
          console.log(`✅ Status updated to: ${updatedProspect.status}`);
          
          // Test conversation message
          console.log('\n💬 Testing conversation message addition');
          const withMessage = await DatabaseService.addConversationMessage(testProspect.id, {
            platform: 'linkedin',
            message: 'Hi! I help law firms with AI automation.',
            sender: 'ai',
            messageType: 'initial'
          });
          console.log('✅ Conversation message added');
          console.log(`   Messages count: ${withMessage.conversationHistory.length}`);
        }

      } else {
        console.log('⚠️ No new prospects were added (might be duplicates)');
      }

      // Final summary
      console.log('\n🎉 Integration Test Summary:');
      console.log(`   Apollo API: ✅ Working`);
      console.log(`   Database: ✅ Working`);
      console.log(`   Pipeline: ✅ Working`);
      console.log(`   Data Flow: ✅ Apollo → Database → ${result.stored} prospects stored`);
      
    } else {
      console.log('❌ Pipeline failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  } finally {
    console.log('\n🔌 Disconnecting from database...');
    await DatabaseService.disconnect();
  }
}

testCompleteIntegration();
