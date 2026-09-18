# Supabase Storage — avatares

O front faz upload direto no bucket **público** do Supabase e salva a URL no perfil via API Django (`PATCH /api/auth/profile/` com `avatar`).

## Variáveis no `frontend/.env`

```env
VITE_SUPABASE_URL=https://ycneuaqfmovroxieptkq.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_SUPABASE_BUCKET=twitter-clone
```

- `VITE_SUPABASE_URL`: Project Settings → API → Project URL  
- `VITE_SUPABASE_ANON_KEY`: Project Settings → API → `anon` `public`  
- `VITE_SUPABASE_BUCKET`: nome do bucket (`twitter-clone`)

## Políticas do bucket (Storage → Policies)

Para bucket público de leitura e upload anônimo (ok para o curso):

```sql
-- Leitura pública
create policy "Public read twitter-clone"
on storage.objects for select
using (bucket_id = 'twitter-clone');

-- Upload
create policy "Public upload twitter-clone"
on storage.objects for insert
with check (bucket_id = 'twitter-clone');

-- Update (upsert)
create policy "Public update twitter-clone"
on storage.objects for update
using (bucket_id = 'twitter-clone')
with check (bucket_id = 'twitter-clone');
```

## Fluxo

1. Usuário escolhe imagem em **Editar perfil**
2. `uploadAvatar()` envia para `storage.from(bucket)`
3. Front recebe `publicUrl`
4. `PATCH /api/auth/profile/` com `{ "avatar": "https://..." }`
