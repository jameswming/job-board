export const environment = {
  production: true,
  // 使用环境变量，这些值将从 GitHub Secrets 获取
  supabaseUrl: process.env['SUPABASE_URL'] ?? '',
  supabaseKey: process.env['SUPABASE_KEY'] ?? ''
}; 