const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();


// บรรทัดนี้สำคัญมาก! บอกให้ Server อ่านภาษา JSON รู้เรื่อง
app.use(express.json());
app.use(cors()); // <--- 2. อนุญาตให้ทุกเว็บเข้ามาคุยได้ (ปลดล็อก)

// --- โซนคำสั่ง (Routes) ---

// 1. ดึงรายการทั้งหมด (GET)
// เข้าลิงก์: http://localhost:3000/transactions
app.get('/transactions', async (req, res) => {
  const transactions = await prisma.transaction.findMany();
  res.json(transactions);
});

// 2. เพิ่มรายการใหม่ (POST)
// ยิงข้อมูลมาที่: http://localhost:3000/transactions
app.post('/transactions', async (req, res) => {
  const { title, amount, type } = req.body; // รับค่าจากคนส่ง
  const result = await prisma.transaction.create({
    data: {
      title: title,
      amount: parseFloat(amount), // แปลงเป็นตัวเลขให้ชัวร์
      type: type,
    },
  });
  res.json(result);
});

// 3. ลบรายการ (DELETE)
// วิธีใช้: ส่งคำขอไปที่ http://localhost:3000/transactions/เลขID
app.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params; // รับเลข ID ที่ส่งมาทาง URL

  try {
    const deletedItem = await prisma.transaction.delete({
      where: {
        id: parseInt(id), // สำคัญ! ต้องแปลงข้อความให้เป็นตัวเลขก่อน
      },
    });
    res.json(deletedItem); // ส่งของที่ลบกลับไปให้ดูว่าลบตัวไหนไป
  } catch (error) {
    res.status(400).json({ error: "หา ID นี้ไม่เจอ หรือลบไปแล้วครับ" });
  }
});

// 4. แก้ไขรายการ (PUT)
// วิธีใช้: ส่งคำขอไปที่ http://localhost:3000/transactions/เลขID
// พร้อมส่งข้อมูลใหม่ที่อยากแก้ไปด้วย
app.put('/transactions/:id', async (req, res) => {
  const { id } = req.params; // รับเลข ID ว่าจะแก้ตัวไหน
  const { title, amount, type } = req.body; // รับข้อมูลใหม่

  try {
    const updatedItem = await prisma.transaction.update({
      where: {
        id: parseInt(id), // ค้นหาจาก ID
      },
      data: {
        title: title,
        amount: parseFloat(amount),
        type: type,
      },
    });
    res.json(updatedItem); // ส่งตัวที่แก้เสร็จแล้วกลับไปโชว์
  } catch (error) {
    res.status(400).json({ error: "ไม่สามารถแก้ไขได้ (อาจจะไม่มี ID นี้)" });
  }
});

// 5. ดูสรุปยอดเงิน (Dashboard)
// วิธีใช้: GET ไปที่ http://localhost:3000/summary
app.get('/summary', async (req, res) => {
  // หาผลรวมของรายรับ (INCOME)
  const incomeObj = await prisma.transaction.aggregate({
    _sum: {
      amount: true, // ขอผลรวมของช่อง amount
    },
    where: {
      type: 'INCOME', // เอาเฉพาะที่เป็นรายรับ
    },
  });

  // หาผลรวมของรายจ่าย (EXPENSE)
  const expenseObj = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      type: 'EXPENSE', // เอาเฉพาะที่เป็นรายจ่าย
    },
  });

  // ดึงตัวเลขออกมา (ถ้าไม่มีรายการเลย ให้ค่าเป็น 0)
  const totalIncome = incomeObj._sum.amount || 0;
  const totalExpense = expenseObj._sum.amount || 0;
  const balance = totalIncome - totalExpense;

  // ส่งผลลัพธ์กลับไป
  res.json({
    totalIncome,
    totalExpense,
    balance
  });
});

// --- เริ่มรัน Server ---
app.listen(3000, () => {
  console.log('🚀 Server พร้อมทำงานที่ port 3000 แล้วครับ Boss!');
});