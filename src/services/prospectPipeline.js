const ApolloService = require('./apollo');
const DatabaseService = require('../database/database');

class ProspectPipeline {
  constructor() {
    this.apollo = new ApolloService();
  }

  // Universal prospect collection - works for any search criteria
  async collectProspects(searchCriteria = {}) {
    console.log('🔄 Starting prospect collection pipeline...');
    console.log('🎯 Target criteria:', JSON.stringify(searchCriteria, null, 2));
    
    try {
      // Use flexible search
      const prospects = await this.apollo.findAllProspects(searchCriteria);
      
      console.log(`📊 Apollo found ${prospects.length} total prospects`);

      if (prospects.length > 0) {
        return this.processAndStoreProspects(prospects);
      } else {
        return { 
          success: true, 
          processed: 0, 
          stored: 0, 
          message: 'No prospects found matching criteria' 
        };
      }

    } catch (error) {
      console.error('Pipeline error:', error);
      return { success: false, error: error.message };
    }
  }

  async processAndStoreProspects(prospects) {
    let stored = 0;
    let skipped = 0;
    let errors = 0;

    console.log(`\n📝 Processing ${prospects.length} prospects for database storage...`);

    for (const prospect of prospects) {
      try {
        console.log(`\n🔍 Processing: ${prospect.first_name} ${prospect.last_name}`);
        
        // Skip if no name
        if (!prospect.first_name || !prospect.last_name) {
          console.log('   ⏭️ Skipped - missing name');
          skipped++;
          continue;
        }

        // Check for duplicates by email
        if (prospect.email && prospect.email !== 'email_not_unlocked@domain.com') {
          const existing = await DatabaseService.searchProspects({
            email: prospect.email
          });

          if (existing.length > 0) {
            console.log('   ⏭️ Skipped - duplicate email');
            skipped++;
            continue;
          }
        }

        // Prepare prospect data (universal format)
        const prospectData = {
          firstName: prospect.first_name.trim(),
          lastName: prospect.last_name.trim(),
          title: prospect.title?.trim() || null,
          company: (prospect.organization?.name || prospect.companyInfo?.name)?.trim() || null,
          email: prospect.email && prospect.email !== 'email_not_unlocked@domain.com' ? 
                 prospect.email.trim() : null,
          phone: prospect.phone?.trim() || null,
          linkedinUrl: prospect.linkedin_url?.trim() || null,
          industry: (prospect.organization?.industry || prospect.companyInfo?.industry)?.trim() || null,
          location: this.formatLocation(prospect),
          status: 'NEW'
        };

        console.log('   📝 Data prepared:', {
          name: `${prospectData.firstName} ${prospectData.lastName}`,
          company: prospectData.company,
          industry: prospectData.industry,
          hasEmail: !!prospectData.email,
          hasLinkedIn: !!prospectData.linkedinUrl
        });

        // Store in database
        const savedProspect = await DatabaseService.createProspect(prospectData);
        stored++;

        console.log(`   ✅ Stored successfully with ID: ${savedProspect.id}`);

      } catch (error) {
        console.error(`   ❌ Error storing prospect:`, error.message);
        errors++;
      }
    }

    const result = {
      success: true,
      processed: prospects.length,
      stored,
      skipped,
      errors
    };

    console.log('\n📊 Pipeline Results Summary:');
    console.log(`   Total processed: ${result.processed}`);
    console.log(`   Successfully stored: ${result.stored}`);
    console.log(`   Skipped (duplicates/invalid): ${result.skipped}`);
    console.log(`   Errors: ${result.errors}`);

    return result;
  }

  formatLocation(prospect) {
    const city = prospect.city?.trim() || '';
    const state = prospect.state?.trim() || '';
    const country = prospect.country?.trim() || '';
    
    const parts = [city, state, country].filter(part => part && part.length > 0);
    return parts.join(', ') || null;
  }

  // Predefined search templates for common use cases
  getSearchTemplate(templateName) {
    const templates = {
      // Legal professionals
      legalPartners: {
        jobTitles: ['Partner', 'Managing Partner', 'Senior Partner', 'Attorney', 'Lawyer'],
        industries: ['Legal Services', 'Law Practice', 'Legal'],
        companySizes: ['11,50', '51,200', '201,500'],
        locations: ['United States']
      },

      // Technology executives  
      techExecutives: {
        jobTitles: ['CEO', 'CTO', 'VP Engineering', 'Engineering Manager', 'Technical Director'],
        industries: ['Information Technology and Services', 'Computer Software', 'Internet'],
        companySizes: ['11,50', '51,200', '201,500'],
        locations: ['United States']
      },

      // Sales leaders
      salesLeaders: {
        jobTitles: ['VP Sales', 'Sales Director', 'Head of Sales', 'Sales Manager', 'Chief Revenue Officer'],
        industries: ['Software', 'Technology', 'SaaS'],
        seniorityLevel: 'senior',
        companySizes: ['51,200', '201,500', '501,1000'],
        locations: ['United States']
      },

      // Marketing executives
      marketingExecutives: {
        jobTitles: ['CMO', 'VP Marketing', 'Marketing Director', 'Head of Marketing'],
        industries: ['Marketing', 'Advertising', 'Digital Marketing'],
        companySizes: ['51,200', '201,500'],
        locations: ['United States']
      },

      // Healthcare professionals
      healthcareProfessionals: {
        jobTitles: ['Doctor', 'Physician', 'Medical Director', 'Healthcare Administrator'],
        industries: ['Healthcare', 'Medical Practice', 'Hospital'],
        companySizes: ['11,50', '51,200', '201,500'],
        locations: ['United States']
      },

      // Financial advisors
      financialAdvisors: {
        jobTitles: ['Financial Advisor', 'Wealth Manager', 'Investment Advisor', 'Portfolio Manager'],
        industries: ['Financial Services', 'Investment Management', 'Banking'],
        companySizes: ['11,50', '51,200'],
        locations: ['United States']
      }
    };

    return templates[templateName] || null;
  }
}

module.exports = ProspectPipeline;
