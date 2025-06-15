import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import OpenAI from 'npm:openai@4.28.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }

    // Get API key from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: apiSettings } = await supabaseClient
      .from('api_requests')
      .select('api_key')
      .eq('id', 2)
      .single();

    if (!apiSettings?.api_key) {
      throw new Error('OpenAI APIキーが設定されていません。システム設定から設定してください。');
    }

    // Get reviews from request body
    const { reviews } = await req.json();

    if (!Array.isArray(reviews)) {
      throw new Error('Invalid request format');
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    if (!openai.apiKey) {
      throw new Error('OpenAI APIキーが設定されていません。');
    }

    const prompt = `
以下の商品レビューを分析し、ポジティブな点とネガティブな点をそれぞれ3つずつ抽出してください。
各ポイントは具体的で、数値や具体例を含むようにしてください。

レビュー:
${reviews.join('\n\n')}

形式:
positive:
- ポイント1
- ポイント2
- ポイント3

negative:
- ポイント1
- ポイント2
- ポイント3
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '商品レビューを分析し、ポジティブな点とネガティブな点を抽出するアシスタントです。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAIからの応答が空でした。');
    }

    // Parse response
    const positiveMatch = content.match(/positive:\n((?:- .*\n?)*)/i);
    const negativeMatch = content.match(/negative:\n((?:- .*\n?)*)/i);

    const positive = positiveMatch ? 
      positiveMatch[1].split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2)) :
      [];

    const negative = negativeMatch ?
      negativeMatch[1].split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2)) :
      [];

    return new Response(
      JSON.stringify({
        positive: positive.length > 0 ? positive : ['レビューからポジティブな点を抽出できませんでした'],
        negative: negative.length > 0 ? negative : ['レビューからネガティブな点を抽出できませんでした']
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'レビューの分析中にエラーが発生しました。'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});