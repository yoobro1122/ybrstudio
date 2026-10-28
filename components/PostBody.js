import { parseBody } from '@/lib/post-body';

export default function PostBody({ content, title }) {
  let n = 0;
  return (
    <div className="post-body">
      {parseBody(content).map((b, i) => {
        if (b.type === 'text') return <p key={i} className="prose">{b.text}</p>;
        n += 1;
        return (
          <figure key={i} className="post-figure">
            <img src={b.src} alt={b.alt || `${title} 사진 ${n}`} loading={n > 1 ? 'lazy' : undefined} />
            {b.alt && <figcaption>{b.alt}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}
