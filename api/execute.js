// Безопасное выполнение JavaScript кода
import { VM } from 'vm2';

export default async function handler(req, res) {
  // CORS для Glide
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, params } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Создаём изолированную среду выполнения
    const vm = new VM({
      timeout: 5000, // 5 секунд максимум
      sandbox: {
        // Передаём параметры из Glide
        p1: params?.p1,
        p2: params?.p2,
        p3: params?.p3,
        p4: params?.p4,
        p5: params?.p5,
      }
    });

    // Выполняем код
    const result = vm.run(`
      (function() {
        ${code}
      })()
    `);

    res.status(200).json({ result });

  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
