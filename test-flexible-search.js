// test-high-email-availability.js
require('dotenv').config();
const ProspectPipeline = require('./src/services/prospectPipeline');

async function testHighEmailAvailability() {
  console.log('🚀 HIGH EMAIL AVAILABILITY TEST');
  console.log('🎯 Targeting prospects most likely to have emails\n');
  
  const pipeline = new ProspectPipeline();
  
  // Criteria optimized for maximum email availability
  const highEmailCriteria = {
    jobTitles: [
      'VP Engineering',
      'Engineering Manager', 
      'Senior Software Engineer'
    ],
    locations: [
      'San Francisco',
      'New York',
      'Seattle'
    ],
    industries: [
      'Computer Software',
      'Financial Services'
    ],
    companySizes: ['201,500', '501,1000'], // Larger companies = better email data
    seniorityLevel: 'senior' // Senior people more likely to have public emails
  };

  try {
    const result = await pipeline.collectProspects(highEmailCriteria);
    
    if (result.success && result.stored > 0) {
      console.log(`✅ Found ${result.stored} senior prospects`);
      
      const prospects = await DatabaseService.getProspectsByStatus('NEW', 20);
      const withEmails = prospects.filter(p => p.email && p.email.includes('@'));
      
      console.log(`📧 ${withEmails.length} prospects have emails (${((withEmails.length/prospects.length)*100).toFixed(1)}%)`);
      
      withEmails.slice(0, 5).forEach((p, i) => {
        console.log(`${i+1}. ${p.firstName} ${p.lastName} - ${p.email} - ${p.company}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testHighEmailAvailability();
