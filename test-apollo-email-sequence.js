require('dotenv').config();
const ApolloEmailSequenceService = require('./src/services/apolloEmailSequence');
const DatabaseService = require('./src/database/database');

async function testApolloEmailSequence() {
  console.log('🚀 Testing Apollo Email Sequence Integration...');
  console.log('API Key loaded:', process.env.APOLLO_API_KEY ? '✅ Yes' : '❌ No');
  console.log('Sequence ID loaded:', process.env.APOLLO_SEQUENCE_ID ? '✅ Yes' : '❌ No');
  console.log('Mailbox ID loaded:', process.env.APOLLO_MAILBOX_ID ? '✅ Yes' : '❌ No');
  
  const apolloEmailService = new ApolloEmailSequenceService();
  
  try {
    // 1. Test sequences endpoint (now using correct POST method)
    console.log('\n📋 Getting available sequences (using POST /search endpoint)...');
    const sequences = await apolloEmailService.getSequences();
    console.log(`Found ${sequences.length} sequences`);
    
    if (sequences.length > 0) {
      console.log('\n📊 Available Sequences:');
      sequences.forEach((seq, index) => {
        console.log(`${index + 1}. ${seq.name || 'Unnamed'} (ID: ${seq.id})`);
        console.log(`   Active: ${seq.active ? '✅ Yes' : '❌ No'}`);
        console.log(`   Steps: ${seq.num_steps || 'Unknown'}`);
      });
      
      // Validate target sequence exists
      const targetSequence = sequences.find(seq => seq.id === process.env.APOLLO_SEQUENCE_ID);
      if (targetSequence) {
        console.log(`\n✅ Target sequence found: "${targetSequence.name}"`);
        console.log(`   Status: ${targetSequence.active ? 'Active' : 'Inactive'}`);
      } else {
        console.log(`\n❌ Target sequence ID (${process.env.APOLLO_SEQUENCE_ID}) not found in available sequences`);
        console.log('   Available sequence IDs:', sequences.map(s => s.id));
        return;
      }
    } else {
      console.log('❌ No sequences found. Create a sequence in Apollo Dashboard first.');
      return;
    }
    
    // 2. Get available email accounts
    console.log('\n📧 Getting available email accounts...');
    const emailAccounts = await apolloEmailService.getEmailAccounts();
    console.log(`Found ${emailAccounts.length} email accounts`);
    
    if (emailAccounts.length > 0) {
      console.log('\n📊 Available Email Accounts:');
      emailAccounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.email} (ID: ${account.id})`);
        console.log(`   Status: ${account.status || 'Active'}`);
      });
      
      // Validate target mailbox exists
      const targetMailbox = emailAccounts.find(acc => acc.id === process.env.APOLLO_MAILBOX_ID);
      if (targetMailbox) {
        console.log(`\n✅ Target mailbox found: ${targetMailbox.email}`);
      } else {
        console.log(`\n❌ Target mailbox ID (${process.env.APOLLO_MAILBOX_ID}) not found`);
        console.log('   Available mailbox IDs:', emailAccounts.map(a => a.id));
        return;
      }
    } else {
      console.log('❌ No email accounts found. Connect your email in Apollo Dashboard first.');
      return;
    }
    
    // 3. Get prospects from database to send emails to
    console.log('\n👥 Getting prospects from database...');
    const prospects = await DatabaseService.getProspectsByStatus('NEW', 5);
    console.log(`Found ${prospects.length} prospects with NEW status`);
    
    if (prospects.length === 0) {
      console.log('❌ No prospects found to send emails to. Test cannot continue.');
      console.log('💡 Run your prospect discovery first to populate the database.');
      return;
    }
    
    // Show prospect details
    console.log('\n👥 Prospect Details:');
    prospects.forEach((prospect, index) => {
      console.log(`${index + 1}. ${prospect.firstName} ${prospect.lastName}`);
      console.log(`   Company: ${prospect.company || 'N/A'}`);
      console.log(`   Email: ${prospect.email || 'N/A'}`);
      console.log(`   Apollo Contact ID: ${prospect.apolloContactId || 'Will be created automatically'}`);
      console.log('   ---');
    });
    
    // UPDATED: Remove the Apollo Contact ID check - let the service handle it
    const prospectsWithApolloIds = prospects.filter(p => p.apolloContactId);
    const prospectsWithoutApolloIds = prospects.filter(p => !p.apolloContactId);
    
    console.log(`\n📊 Apollo Contact Status:`);
    console.log(`   Prospects with Apollo Contact IDs: ${prospectsWithApolloIds.length}`);
    console.log(`   Prospects without Apollo Contact IDs: ${prospectsWithoutApolloIds.length}`);
    console.log(`   📝 The service will automatically create missing Apollo contacts`);
    
    // 4. Send emails to ALL prospects (service will create contacts as needed)
    console.log('\n📤 Starting Apollo Email Sequence Process...');
    console.log('🔄 This will automatically:');
    console.log('   1. Create Apollo contacts for prospects without Contact IDs');
    console.log('   2. Update database with new Apollo Contact IDs');
    console.log('   3. Add all contacts to the email sequence');
    console.log('   4. Update prospect statuses to MESSAGED\n');
    
    const prospectIds = prospects.map(p => p.id); // Use ALL prospects, not just ones with Apollo IDs
    const sequenceId = process.env.APOLLO_SEQUENCE_ID;
    const emailAccountId = process.env.APOLLO_MAILBOX_ID;
    
    console.log(`Using Sequence ID: ${sequenceId}`);
    console.log(`Using Email Account ID: ${emailAccountId}`);
    console.log(`Processing ${prospectIds.length} prospects (including contact creation)`);
    
    // This will now automatically create contacts before adding to sequence
    const result = await apolloEmailService.sendEmailsToProspects(
      prospectIds,
      sequenceId,
      emailAccountId
    );
    
    console.log('\n📊 Complete Email Automation Result:');
    console.log(`Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`Message: ${result.message}`);
    
    if (result.details) {
      console.log('\n📋 Detailed Results:');
      console.log(`   Contacts Created: ${result.details.contactsCreated || 0}`);
      console.log(`   Contacts Skipped: ${result.details.contactsSkipped || 0}`);
      console.log(`   Added to Sequence: ${result.details.addedToSequence || 0}`);
      
      if (result.details.apolloResult) {
        console.log(`   Apollo Response: ${JSON.stringify(result.details.apolloResult, null, 2)}`);
      }
    }
    
    if (result.success) {
      console.log('\n🎉 Complete Email Automation Test Successful!');
      console.log('✅ Apollo contacts created for prospects without Contact IDs');
      console.log('✅ Database updated with new Apollo Contact IDs');
      console.log('✅ Prospects added to email sequence');
      console.log('✅ Prospect statuses updated to MESSAGED');
      console.log('✅ Your AI SDR system is fully operational!');
      
      // Show updated prospect status
      console.log('\n📊 Final Verification:');
      const updatedProspects = await DatabaseService.getProspectsByStatus('MESSAGED', 10);
      console.log(`Found ${updatedProspects.length} prospects with MESSAGED status`);
      
      if (updatedProspects.length > 0) {
        console.log('\n📧 Prospects Successfully Added to Email Sequence:');
        updatedProspects.slice(0, 3).forEach((p, i) => {
          console.log(`${i + 1}. ${p.firstName} ${p.lastName} - Apollo ID: ${p.apolloContactId}`);
        });
      }
    } else {
      console.log('\n❌ Email automation test failed');
      console.log(`Reason: ${result.message}`);
      
      if (result.error) {
        console.log('Error Details:', result.error);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    
    if (error.response?.data) {
      console.error('\n📋 API Error Details:');
      console.error(JSON.stringify(error.response.data, null, 2));
      
      // Provide specific error guidance
      if (error.response.status === 403) {
        console.error('\n💡 403 Error Solutions:');
        console.error('   - Ensure you have a Master API key');
        console.error('   - Check if your Apollo account has a paid plan');
        console.error('   - Verify sequences feature is enabled for your account');
      } else if (error.response.status === 404) {
        console.error('\n💡 404 Error Solutions:');
        console.error('   - Check if the endpoint URL is correct');
        console.error('   - Ensure your Apollo account has sequences enabled');
      }
    }
    
    console.error('\n🔧 Debug Information:');
    console.error(`API Base URL: ${apolloEmailService.baseURL || 'undefined'}`);
    console.error(`Request Method: ${error.config?.method || 'undefined'}`);
    console.error(`Request URL: ${error.config?.url || 'undefined'}`);
  }
}

// Run the test
testApolloEmailSequence().catch(console.error);
