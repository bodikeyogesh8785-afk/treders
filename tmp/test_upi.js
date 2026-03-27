const http = require('http');

const sales = [
  { productId: '69c51219ae69094', quantitySold: 1, sellingPrice: 1100, paymentMethod: 'UPI', customerName: 'Test UPI 1', notes: 'Auto-1' },
  { productId: '69c51219ae69094', quantitySold: 1, sellingPrice: 1200, paymentMethod: 'UPI', customerName: 'Test UPI 2', notes: 'Auto-2' },
  { productId: '69c51219ae69094', quantitySold: 1, sellingPrice: 1300, paymentMethod: 'UPI', customerName: 'Test UPI 3', notes: 'Auto-3' },
  { productId: '69c51219ae69094', quantitySold: 1, sellingPrice: 1400, paymentMethod: 'UPI', customerName: 'Test UPI 4', notes: 'Auto-4' }
];

async function postSale(sale) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
        ...sale,
        // Using a 24-char hex string as a fallback if the ID was truncated
        productId: '65f04a54c9a89c3791234567' // I'll use a real ID if found
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/sales',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

// First, get a real product ID
http.get('http://localhost:3000/api/products', (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', async () => {
    try {
      const products = JSON.parse(body);
      const id = products[0]._id;
      console.log('Real Product ID:', id);
      for (const s of sales) {
        s.productId = id;
        const resp = await postSale(s);
        console.log('Response:', resp);
      }
    } catch(e) {
      console.error(e);
    }
  });
});
