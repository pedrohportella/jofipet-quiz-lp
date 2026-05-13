'use client';

import { trackArticleClick } from '@/lib/tracking/events';
import { loadStoredUtms } from '@/lib/tracking/utms';
import contentJson from '../../../config/content.json';

interface Article {
  id: string;
  title: string;
  emoji: string;
  url: string;
}

const articles: Article[] = (contentJson as { articles: Article[] }).articles;

function withUtms(rawUrl: string, articleId: string): string {
  const utms = loadStoredUtms();
  try {
    const url = new URL(rawUrl);
    for (const [k, v] of Object.entries(utms)) {
      if (typeof v === 'string' && v.length > 0 && !url.searchParams.has(k)) {
        url.searchParams.set(k, v);
      }
    }
    if (!url.searchParams.has('utm_content')) {
      url.searchParams.set('utm_content', `quiz-frio-art-${articleId}`);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function ArticleCards() {
  return (
    <div className="flex w-full flex-col gap-3">
      {articles.map((article) => (
        <a
          key={article.id}
          href={withUtms(article.url, article.id)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackArticleClick({
              articleId: article.id,
              utmContent: `quiz-frio-art-${article.id}`,
            })
          }
          className="flex items-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-left text-base text-neutral-900 transition-colors hover:border-primary hover:bg-primary-50"
        >
          <span className="text-2xl" aria-hidden="true">
            {article.emoji}
          </span>
          <span className="flex-1">{article.title}</span>
          <span className="text-primary" aria-hidden="true">
            →
          </span>
        </a>
      ))}
    </div>
  );
}
