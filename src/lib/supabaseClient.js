import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kxymgcmgjlakgtzhfden.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW1nY21namxha2d0emhmZGVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM4NTUzNiwiZXhwIjoyMDY1OTYxNTM2fQ.yHNFjhen1oRgWkbqoKCTA7VZweYpSwc9rKJWTuBZMQU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
