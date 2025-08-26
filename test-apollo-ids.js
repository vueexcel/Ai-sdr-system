const getIds = async () => {
  const service = new ApolloEmailSequenceService();
  
  // Get your mailbox ID (from step 1)
  const accounts = await service.getEmailAccounts();
  console.log('📧 Mailbox ID:', accounts[0]?.id);
  
  // Get your sequence ID
  console.log('\n🔍 Getting your email sequences...');
  const sequences = await service.getSequences();
  
  if (sequences.length > 0) {
    console.log('\n📝 Your Available Sequences:');
    sequences.forEach((seq, index) => {
      console.log(`${index + 1}. Name: ${seq.name}`);
      console.log(`   Sequence ID: ${seq.id}`);
      console.log(`   Status: ${seq.active ? 'Active' : 'Inactive'}`);
      console.log('   ---');
    });
  } else {
    console.log('❌ No sequences found. Create one in Apollo Dashboard first.');
  }
};
