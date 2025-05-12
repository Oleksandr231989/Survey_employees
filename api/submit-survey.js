const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request received in API');
    
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error: Missing Supabase credentials' });
    }
    
    console.log('Supabase URL present:', !!supabaseUrl);
    console.log('Supabase Key present:', !!supabaseKey);
    
    // Create Supabase client with additional options
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Ensure we have a valid request body
    if (!req.body) {
      return res.status(400).json({ error: 'Missing request body' });
    }
    
    // Log request body
    try {
      console.log('Request body:', typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    } catch (e) {
      console.log('Could not stringify request body');
    }
    
    // Get form data from request body
    const {
      country,
      satisfaction_level,
      strengths,
      improvement_recommendations,
      faced_challenges,
      main_challenge,
      support_assessment,
      manager_discussion_quality
    } = req.body;
    
    // Validate required fields
    if (!country || !satisfaction_level || !strengths || !improvement_recommendations || 
        faced_challenges === undefined || !support_assessment || !manager_discussion_quality) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Prepare data for insertion
    const insertData = {
      country,
      satisfaction_level,
      strengths,
      improvement_recommendations,
      faced_challenges,
      main_challenge: faced_challenges ? main_challenge : null,
      support_assessment,
      manager_discussion_quality,
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    };
    
    console.log('Data to insert:', JSON.stringify(insertData));
    
    // Insert data into Supabase
    try {
      console.log('Attempting to insert data...');
      const { data, error } = await supabase
        .from('survey_responses')
        .insert([insertData]);
      
      if (error) {
        console.error('Supabase error:', JSON.stringify(error));
        return res.status(500).json({ error: 'Database error: ' + error.message });
      }
      
      console.log('Data inserted successfully');
      return res.status(200).json({ success: true });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return res.status(500).json({ error: 'Database operation failed: ' + dbError.message });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};
