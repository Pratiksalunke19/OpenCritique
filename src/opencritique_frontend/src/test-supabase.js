import { supabase } from './lib/supabaseClient';

// Test Supabase connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .single();
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connected successfully!', data);
    }
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}

testConnection();