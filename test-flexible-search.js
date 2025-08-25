require('dotenv').config();
const ProspectPipeline = require('./src/services/prospectPipeline');
const DatabaseService = require('./src/database/database');

async function testFlexibleSearch() {
  console.log('🚀 Testing Flexible AI SDR System - Universal Search');
  
  const pipeline = new ProspectPipeline();

  // Test different search scenarios
  const searchScenarios = [
    {
      name: 'Legal Partners (Original Use Case)',
      criteria: pipeline.getSearchTemplate('legalPartners')
    },
    {
      name: 'Technology Executives',
      criteria: pipeline.getSearchTemplate('techExecutives')
    },
    {
      name: 'Custom: Real Estate Agents in California',
      criteria: {
        jobTitles: ['Real Estate Agent', 'Realtor', 'Real Estate Broker'],
        industries: ['Real Estate'],
        locations: ['California'],
        companySizes: ['1,10', '11,50']
      }
    },
    {
      name: 'Custom: Marketing Directors at SaaS Companies',
      criteria: {
        jobTitles: ['Marketing Director', 'VP Marketing', 'Head of Marketing'],
        keywords: ['SaaS', 'software', 'B2B'],
        companySizes: ['51,200', '201,500'],
        locations: ['United States', 'Canada']
      }
    }
  ];

  for (const scenario of searchScenarios) {
    try {
      console.log(`\n🎯 Testing: ${scenario.name}`);
      console.log('📋 Criteria:', JSON.stringify(scenario.criteria, null, 2));
      
      const result = await pipeline.collectProspects(scenario.criteria);
      
      if (result.success) {
        console.log(`✅ ${scenario.name}: ${result.stored} prospects stored`);
        
        if (result.stored > 0) {
          // Show sample prospects
          const prospects = await DatabaseService.getProspectsByStatus('NEW', 3);
          console.log(`\n👥 Sample prospects:`);
          prospects.slice(0, 2).forEach((p, i) => {
            console.log(`  ${i+1}. ${p.firstName} ${p.lastName} - ${p.title} at ${p.company}`);
          });
        }
      } else {
        console.log(`❌ ${scenario.name}: Failed - ${result.error}`);
      }
      
      // Delay between searches
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`❌ Error testing ${scenario.name}:`, error.message);
    }
  }

  // Final stats
  const stats = await DatabaseService.getProspectStats();
  console.log('\n📊 Final Database Stats:');
  console.log(`Total prospects: ${stats.totalProspects}`);
  
  await DatabaseService.disconnect();
}

testFlexibleSearch();
