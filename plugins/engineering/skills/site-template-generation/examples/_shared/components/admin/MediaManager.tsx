'use client';

import { useState } from 'react';

type Upload = { src: string; name: string; bytes: number; modifiedAt: string };
type Uploaded = Upload & { originalBytes?: number; width?: number; height?: number };

export default function MediaManager({ initial, csrf }: { initial: Upload[]; csrf: string }) {
  const [uploads, setUploads] = useState(initial);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  async function send(file: File) {
    const body = new FormData();
    body.set('file', file);
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'x-csrf-token': csrf },
      body,
    });
    const result = (await response.json()) as { ok: boolean; error?: string } & Partial<Uploaded>;
    if (!response.ok || !result.ok) {
      setError(true);
      setMessage(result.error ?? 'envoi refusé');
      return;
    }
    setError(false);
    const saved = Math.round((result.bytes ?? 0) / 1024);
    const sent = Math.round((result.originalBytes ?? 0) / 1024);
    setMessage(
      sent > saved
        ? `Image envoyée et optimisée : ${sent} ko reçus, ${saved} ko servis (${result.width} par ${result.height} pixels). Son chemin peut maintenant être choisi dans Contenu.`
        : `Image envoyée (${saved} ko). Son chemin peut maintenant être choisi dans Contenu.`,
    );
    setUploads([
      { src: result.src!, name: result.name!, bytes: result.bytes!, modifiedAt: new Date().toISOString() },
      ...uploads,
    ]);
  }

  return (
    <div>
      <p className="field">
        <label className="field__label" htmlFor="upload">
          Envoyer une image
        </label>
        <input
          id="upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void send(file);
            event.target.value = '';
          }}
        />
        <span className="admin-field__hint">
          JPEG, PNG, WebP, AVIF ou HEIC, 12 Mo maximum. Envoyez la photo telle qu'elle sort de votre
          téléphone : elle est redimensionnée, allégée et débarrassée de ses données de localisation
          automatiquement. Le SVG est refusé : il peut contenir du script.
        </span>
      </p>

      <p className={error ? 'form__status form__status--error' : 'form__status'} role="status" aria-live="polite">
        {message}
      </p>

      <ul className="admin-media">
        {uploads.map((upload) => (
          <li key={upload.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={upload.src} alt="" />
            <p className="admin-field__hint">
              {upload.src}
              <br />
              {Math.round(upload.bytes / 1024)} ko
            </p>
            <button
              type="button"
              className="admin-small"
              onClick={async () => {
                const response = await fetch(
                  `/api/admin/upload?name=${encodeURIComponent(upload.name)}`,
                  { method: 'DELETE', headers: { 'x-csrf-token': csrf } },
                );
                if (response.ok) setUploads(uploads.filter((item) => item.name !== upload.name));
              }}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      {uploads.length === 0 ? <p className="admin-field__hint">Aucune image pour le moment.</p> : null}
    </div>
  );
}
