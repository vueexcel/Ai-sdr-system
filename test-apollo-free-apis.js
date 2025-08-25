require('dotenv').config();
const ApolloService = require('./src/services/apollo');

async function testCorrectFormatApollo() {
  const apollo = new ApolloService();
  
  console.log('🚀 Testing Apollo with CORRECT Employee Range Format...');
  console.log('API Key loaded:', process.env.APOLLO_API_KEY ? '✅ Yes' : '❌ No');
  console.log('Format: Using comma-separated ranges (e.g., "11,50" per documentation)\n');

  try {
    // Test comprehensive search
    const allProspects = await apollo.findAllLegalProspects();

    if (allProspects.length > 0) {
      console.log(`\n🎯 SUCCESS! Found ${allProspects.length} total legal prospects\n`);
      
      console.log('📊 Top 5 Legal Prospects:');
      allProspects.slice(0, 5).forEach((person, index) => {
        console.log(`\n${index + 1}. ${person.first_name || 'N/A'} ${person.last_name || 'N/A'}`);
        console.log(`   Title: ${person.title || 'N/A'}`);
        console.log(`   Company: ${person.organization?.name || person.firmInfo?.name || 'N/A'}`);
        console.log(`   Industry: ${person.organization?.industry || person.firmInfo?.industry || 'N/A'}`);
        console.log(`   Location: ${person.city || 'N/A'}, ${person.state || 'N/A'}`);
        console.log(`   Email: ${person.email || 'N/A'}`);
        console.log(`   Phone: ${person.phone || 'N/A'}`);
        console.log(`   LinkedIn: ${person.linkedin_url ? '✅' : '❌'}`);
        
        if (person.firmInfo) {
          console.log(`   Firm Info: ${person.firmInfo.employees || 'N/A'} employees`);
        }
      });

      // Show statistics
      const withEmail = allProspects.filter(p => p.email).length;
      const withLinkedIn = allProspects.filter(p => p.linkedin_url).length;
      const withPhone = allProspects.filter(p => p.phone).length;

      console.log('\n📈 Statistics:');
      console.log(`   Total prospects: ${allProspects.length}`);
      console.log(`   With email: ${withEmail} (${Math.round(withEmail/allProspects.length*100)}%)`);
      console.log(`   With LinkedIn: ${withLinkedIn} (${Math.round(withLinkedIn/allProspects.length*100)}%)`);
      console.log(`   With phone: ${withPhone} (${Math.round(withPhone/allProspects.length*100)}%)`);

      // Show company breakdown
      const companies = {};
      allProspects.forEach(p => {
        const company = p.organization?.name || p.firmInfo?.name || 'Unknown';
        companies[company] = (companies[company] || 0) + 1;
      });

      console.log('\n🏢 Top Companies:');
      Object.entries(companies)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([company, count]) => {
          console.log(`   ${company}: ${count} prospects`);
        });

    } else {
      console.log('⚠️ No prospects found. This might indicate:');
      console.log('   - API key permissions issue');
      console.log('   - Search criteria too restrictive');
      console.log('   - Rate limiting or temporary API issues');
    }

    console.log('\n🎉 Test Complete!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCorrectFormatApollo();
