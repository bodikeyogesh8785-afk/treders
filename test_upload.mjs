import fs from 'fs';

async function testUpload() {
  const formData = new FormData();
  const fileContent = fs.readFileSync('./public/file.svg');
  // @ts-ignore
  const file = new File([fileContent], 'test-image.svg', { type: 'image/svg+xml' });
  formData.append('image', file);

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    console.log('Upload response:', data);
  } catch (error) {
    console.error('Test upload failed:', error);
  }
}

testUpload();
