'use client';

export default function LogoutButton({ csrf }: { csrf: string }) {
  return (
    <button
      type="button"
      className="admin-small"
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST', headers: { 'x-csrf-token': csrf } });
        window.location.href = '/admin/login';
      }}
    >
      Se déconnecter
    </button>
  );
}
