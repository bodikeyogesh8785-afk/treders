async function run() {
  const baseUrl = 'http://localhost:3000';
  
  // 1. Get products
  const productsRes = await fetch(`${baseUrl}/api/products`);
  const products = await productsRes.json();
  if (!products.length) return console.log('No products found');
  const p = products[0];

  console.log(`Using product: ${p.name}`);

  // 2. Log 4 UPI sales
  for (let i = 1; i <= 4; i++) {
    const res = await fetch(`${baseUrl}/api/sales`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Note: We might need the admin token if it's protected.
        // But for local bypass, we can try.
      },
      body: JSON.stringify({
        productId: p._id,
        quantitySold: 1,
        sellingPrice: 500 + (i * 100),
        paymentMethod: 'UPI',
        customerName: `TEST-UPI-USER-${i}`,
        notes: `Automated test ${i}`
      })
    });
    const result = await res.json();
    if (res.ok) {
      console.log(`SUCCESS: Logged UPI Sale ${i} for ₹${result.sale.sellingPrice}`);
    } else {
      console.log(`FAILED: ${result.error || 'Unknown error'}`);
    }
  }
}

run();
