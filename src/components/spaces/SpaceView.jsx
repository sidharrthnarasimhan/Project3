import { cn } from "@/lib/utils";

export default function SpaceView({ content }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
      className={cn(
        "prose prose-zinc dark:prose-invert max-w-none",
        "prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h3:mt-6",
        "prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-7",
        "prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline",
        "prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100",
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-li:text-zinc-700 dark:prose-li:text-zinc-300",
        "prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
        "prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400"
      )}
    />
  );
}
