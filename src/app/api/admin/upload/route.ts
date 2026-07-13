import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'services';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato não suportado. Use JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Determine file extension from MIME type
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    const ext = extMap[file.type] || '.jpg';

    // Create upload directory if it doesn't exist
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const uploadDir = join(process.cwd(), 'public', 'uploads', sanitizedFolder);
    await mkdir(uploadDir, { recursive: true });

    // Save file with unique name
    const fileName = `${randomUUID()}${ext}`;
    const filePath = join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return the public URL path
    const url = `/uploads/${sanitizedFolder}/${fileName}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
