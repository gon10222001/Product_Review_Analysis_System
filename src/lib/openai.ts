import OpenAI from 'openai';

/**
 * Filter reviews by keyword
 */
function filterReviewsByKeyword(reviews: string[], keyword: string): string[] {
  if (!keyword) return reviews;
  
  return reviews.filter(review => 
    review.toLowerCase().includes(keyword.toLowerCase())
  );
}

interface AnalysisResult {
  positive: string[];
  negative: string[];
  keyword?: string;
}

/**
 * Analyze reviews using OpenAI with signal support
 */
export async function analyzeReviewsWithOpenAI(
  reviews: string[],
  signal?: AbortSignal,
  keyword?: string
): Promise<AnalysisResult> {
  try {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const prompt = keyword 
      ? `以下のレビューを「${keyword}」というキーワードに基づいて分析し、ポジティブな点とネガティブな点をそれぞれ3つずつ箇条書きで抽出してください。\n\nレビュー:\n${reviews.join('\n\n')}`
      : `以下のレビューを分析し、ポジティブな点とネガティブな点をそれぞれ3つずつ箇条書きで抽出してください。\n\nレビュー:\n${reviews.join('\n\n')}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'あなたは商品レビューの分析専門家です。与えられたレビューから、ポジティブな点とネガティブな点をそれぞれ3つずつ箇条書きで抽出してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    }, {
      signal
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAIからの応答が空でした。');
    }

    // デバッグログを追加
    console.log('OpenAI Response:', content);

    // シンプルな分割処理に変更
    const lines = content.split('\n');
    const positive: string[] = [];
    const negative: string[] = [];
    let currentSection: 'positive' | 'negative' | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 日本語のセクションタイトルに対応
      if (trimmedLine.includes('ポジティブな点:')) {
        currentSection = 'positive';
        continue;
      }
      if (trimmedLine.includes('ネガティブな点:')) {
        currentSection = 'negative';
        continue;
      }
      
      // 箇条書きの形式に対応（数字付きとハイフン付きの両方）
      if ((trimmedLine.match(/^\d+\./) || trimmedLine.startsWith('-')) && trimmedLine.length > 2) {
        const point = trimmedLine.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
        if (currentSection === 'positive' && positive.length < 3) {
          positive.push(point);
        } else if (currentSection === 'negative' && negative.length < 3) {
          negative.push(point);
        }
      }
    }

    // デバッグログを追加
    console.log('Extracted Positive:', positive);
    console.log('Extracted Negative:', negative);

    return {
      positive: positive.length > 0 ? positive : ['レビューからポジティブな点を抽出できませんでした'],
      negative: negative.length > 0 ? negative : ['レビューからネガティブな点を抽出できませんでした'],
      keyword
    };
  } catch (error) {
    console.error('Error analyzing reviews with OpenAI:', error);
    throw error instanceof Error ? error : new Error('レビューの分析中にエラーが発生しました。');
  }
}
