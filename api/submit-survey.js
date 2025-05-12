// api/submit-survey.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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
    
    // Insert data into Supabase
    const { data, error } = await supabase
      .from('survey_responses')
      .insert([{
        country,
        satisfaction_level,
        strengths,
        improvement_recommendations,
        faced_challenges,
        main_challenge: faced_challenges ? main_challenge : null,
        support_assessment,
        manager_discussion_quality,
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      }]);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error submitting survey:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
