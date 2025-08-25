const axios = require('axios');

class ApolloService {
  constructor() {
    this.apiKey = process.env.APOLLO_API_KEY;
    this.baseURL = 'https://api.apollo.io/api/v1';
  }

  // Universal prospect search - works for any industry/role
  async findProspects(searchCriteria) {
    try {
      const params = new URLSearchParams();
      
      // Job titles (flexible - any titles)
      if (searchCriteria.jobTitles && searchCriteria.jobTitles.length > 0) {
        searchCriteria.jobTitles.forEach(title => {
          params.append('person_titles[]', title);
        });
      }
      
      // Industries (flexible - any industries)  
      if (searchCriteria.industries && searchCriteria.industries.length > 0) {
        searchCriteria.industries.forEach(industry => {
          params.append('organization_industries[]', industry);
        });
      }
      
      // Locations (flexible - any locations)
      if (searchCriteria.locations && searchCriteria.locations.length > 0) {
        searchCriteria.locations.forEach(location => {
          params.append('person_locations[]', location);
        });
      } else {
        // Default to United States if no location specified
        params.append('person_locations[]', 'United States');
      }
      
      // Company sizes (flexible ranges)
      if (searchCriteria.companySizes && searchCriteria.companySizes.length > 0) {
        searchCriteria.companySizes.forEach(size => {
          params.append('organization_num_employees_ranges[]', size);
        });
      } else {
        // Default company size ranges
        ['11,50', '51,200', '201,500'].forEach(size => {
          params.append('organization_num_employees_ranges[]', size);
        });
      }
      
      // Keywords (flexible - search by company keywords)
      if (searchCriteria.keywords && searchCriteria.keywords.length > 0) {
        searchCriteria.keywords.forEach(keyword => {
          params.append('organization_keyword_tags[]', keyword);
        });
      }
      
      // Seniority level
      if (searchCriteria.seniorityLevel) {
        params.append('person_seniority_levels[]', searchCriteria.seniorityLevel);
      }
      
      // Years of experience
      if (searchCriteria.minExperience) {
        params.append('person_num_years_exp_min', searchCriteria.minExperience);
      }
      if (searchCriteria.maxExperience) {
        params.append('person_num_years_exp_max', searchCriteria.maxExperience);
      }
      
      // Pagination
      params.append('page', searchCriteria.page || 1);
      params.append('per_page', searchCriteria.limit || 50);

      const url = `${this.baseURL}/mixed_people/search?${params.toString()}`;
      console.log(`🔍 Searching for prospects with criteria:`, searchCriteria);

      const response = await axios.post(url, {}, {
        headers: {
          'x-api-key': this.apiKey,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      });

      console.log(`🎯 Found ${response.data.people?.length || 0} prospects`);
      return response.data.people || [];

    } catch (error) {
      console.error('Apollo Prospect Search Error:', error.response?.data || error.message);
      return [];
    }
  }

  // Universal company search  
  async findCompanies(searchCriteria) {
    try {
      const requestBody = {
        page: searchCriteria.page || 1,
        per_page: searchCriteria.limit || 25
      };

      // Industries (any industries)
      if (searchCriteria.industries && searchCriteria.industries.length > 0) {
        requestBody.q_organization_industries = searchCriteria.industries.join(',');
      }

      // Locations (any locations)
      if (searchCriteria.locations && searchCriteria.locations.length > 0) {
        requestBody.q_organization_locations = searchCriteria.locations.join(',');
      }

      // Company sizes
      if (searchCriteria.companySizes && searchCriteria.companySizes.length > 0) {
        requestBody.organization_num_employees_ranges = searchCriteria.companySizes;
      }

      // Keywords for company search
      if (searchCriteria.keywords && searchCriteria.keywords.length > 0) {
        requestBody.q_organization_keyword_tags = searchCriteria.keywords.join(',');
      }

      // Revenue range
      if (searchCriteria.revenueMin || searchCriteria.revenueMax) {
        requestBody.organization_estimated_revenue_ranges = [];
        if (searchCriteria.revenueMin && searchCriteria.revenueMax) {
          requestBody.organization_estimated_revenue_ranges.push(`${searchCriteria.revenueMin},${searchCriteria.revenueMax}`);
        }
      }

      // Founded year
      if (searchCriteria.foundedAfter) {
        requestBody.organization_founded_date_start = searchCriteria.foundedAfter;
      }
      if (searchCriteria.foundedBefore) {
        requestBody.organization_founded_date_end = searchCriteria.foundedBefore;
      }

      console.log('🔍 Company search criteria:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(`${this.baseURL}/organizations/search`, requestBody, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        }
      });

      const companies = response.data.organizations || [];
      console.log(`🏢 Found ${companies.length} companies`);
      return companies;

    } catch (error) {
      console.error('Apollo Company Search Error:', error.response?.data || error.message);
      return [];
    }
  }

  // Get prospects from specific companies
  async getProspectsFromCompanies(companies, prospectCriteria = {}) {
    const allProspects = [];
    
    for (const company of companies.slice(0, prospectCriteria.maxCompanies || 10)) {
      try {
        const params = new URLSearchParams();
        
        // Search by company domain or name
        if (company.primary_domain) {
          params.append('organization_domains[]', company.primary_domain);
        } else if (company.name) {
          params.append('organization_names[]', company.name);
        }
        
        // Job titles from criteria
        if (prospectCriteria.jobTitles && prospectCriteria.jobTitles.length > 0) {
          prospectCriteria.jobTitles.forEach(title => {
            params.append('person_titles[]', title);
          });
        }

        // Seniority level
        if (prospectCriteria.seniorityLevel) {
          params.append('person_seniority_levels[]', prospectCriteria.seniorityLevel);
        }
        
        params.append('per_page', prospectCriteria.perCompanyLimit || '10');
        const url = `${this.baseURL}/mixed_people/search?${params.toString()}`;

        console.log(`🔍 Searching prospects at ${company.name}`);

        const response = await axios.post(url, {}, {
          headers: {
            'x-api-key': this.apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        const prospects = response.data.people || [];
        
        // Enrich prospects with company info
        const enrichedProspects = prospects.map(person => ({
          ...person,
          companyInfo: {
            name: company.name,
            domain: company.primary_domain,
            employees: company.estimated_num_employees,
            industry: company.industry,
            website: company.website_url,
            location: `${company.city || ''}, ${company.state || ''}`.replace(/^,\s*/, ''),
            revenue: company.estimated_revenue_printed,
            founded: company.founded_year
          }
        }));

        allProspects.push(...enrichedProspects);
        console.log(`👥 Found ${prospects.length} prospects at ${company.name}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error searching ${company.name}:`, error.response?.data || error.message);
        continue;
      }
    }

    return allProspects;
  }

  // Enhanced search with multiple strategies
  async findAllProspects(searchCriteria) {
    console.log('🎯 Starting comprehensive prospect search...');
    console.log('🔍 Search criteria:', JSON.stringify(searchCriteria, null, 2));
    let allProspects = [];

    try {
      // Strategy 1: Direct prospect search
      console.log('\n📋 Strategy 1: Direct Prospect Search');
      const directProspects = await this.findProspects(searchCriteria);
      
      if (directProspects.length > 0) {
        allProspects.push(...directProspects);
        console.log(`✅ Direct search: ${directProspects.length} prospects`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Strategy 2: Company-first approach
      console.log('\n📋 Strategy 2: Company → Prospects Approach');
      const companies = await this.findCompanies(searchCriteria);

      if (companies.length > 0) {
        console.log(`🏢 Found ${companies.length} companies`);
        
        const companyProspects = await this.getProspectsFromCompanies(companies, {
          jobTitles: searchCriteria.jobTitles,
          seniorityLevel: searchCriteria.seniorityLevel,
          maxCompanies: 10,
          perCompanyLimit: 10
        });
        
        if (companyProspects.length > 0) {
          allProspects.push(...companyProspects);
          console.log(`✅ Company-based search: ${companyProspects.length} prospects`);
        }
      }

      // Remove duplicates based on email
      const uniqueProspects = allProspects.reduce((unique, prospect) => {
        const email = prospect.email;
        if (email && email !== 'email_not_unlocked@domain.com' && !unique.find(p => p.email === email)) {
          unique.push(prospect);
        } else if (!email) {
          unique.push(prospect); // Keep prospects without email for now
        }
        return unique;
      }, []);

      console.log(`\n🎉 Total unique prospects found: ${uniqueProspects.length}`);
      return uniqueProspects;

    } catch (error) {
      console.error('❌ Comprehensive search error:', error);
      return allProspects;
    }
  }
}

module.exports = ApolloService;
