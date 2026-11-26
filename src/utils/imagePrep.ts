export interface PreparedImage {
  dataUrl: string;
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileName: string;
}

const MAX_DIMENSION = 1024;

function resizeImageElement(
  img: HTMLImageElement,
  fileName: string
): PreparedImage {
  const naturalW = img.naturalWidth || img.width || 800;
  const naturalH = img.naturalHeight || img.height || 600;

  let targetW = naturalW;
  let targetH = naturalH;

  if (naturalW > MAX_DIMENSION || naturalH > MAX_DIMENSION) {
    if (naturalW >= naturalH) {
      targetW = MAX_DIMENSION;
      targetH = Math.round((naturalH / naturalW) * MAX_DIMENSION);
    } else {
      targetH = MAX_DIMENSION;
      targetW = Math.round((naturalW / naturalH) * MAX_DIMENSION);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize image canvas.');
  }
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

  return {
    dataUrl,
    base64,
    mimeType: 'image/jpeg',
    fileName,
  };
}

export async function prepareFileForClassification(
  file: File
): Promise<PreparedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(new Error('Unsupported or unreadable image file.'));
      image.src = objectUrl;
    });
    return resizeImageElement(img, file.name);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function prepareUrlForClassification(
  url: string,
  fileName: string
): Promise<PreparedImage> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not load sample image.');
  }
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
  return prepareFileForClassification(file);
}
