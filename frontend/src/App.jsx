import { useState, useEffect } from 'react'

function App() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 })

  // สร้างตัวแปรสำหรับเก็บค่าที่พิมพ์ในฟอร์ม
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE' // ค่าเริ่มต้นให้เป็น รายจ่าย
  })

  const fetchData = async () => {
    try {
      const res1 = await fetch('http://localhost:3000/transactions')
      const data1 = await res1.json()
      setTransactions(data1)
      const res2 = await fetch('http://localhost:3000/summary')
      const data2 = await res2.json()
      setSummary(data2)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ฟังก์ชันนี้จะทำงานตอน Boss พิมพ์ข้อความ
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // ฟังก์ชันนี้จะทำงานตอนกดปุ่ม "บันทึก"
  const handleSubmit = async (e) => {
    e.preventDefault() // ห้ามรีเฟรชหน้าจอ
    try {
      // ยิงข้อมูลไปหา Backend (POST)
      const response = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // แปลงข้อมูลเป็น JSON ส่งไป
      })

      if (response.ok) {
        fetchData() // ดึงข้อมูลใหม่มาโชว์ทันที
        setFormData({ title: '', amount: '', type: 'EXPENSE' }) // ล้างช่องกรอกให้ว่าง
        alert('บันทึกเรียบร้อยครับ Boss! ✅')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึก')
    }
  }

  // ฟังก์ชันสั่งลบ (แถมให้ครับ)
  const handleDelete = async (id) => {
    if(!confirm("จะลบรายการนี้จริงหรอครับ Boss?")) return;
    
    await fetch(`http://localhost:3000/transactions/${id}`, {
        method: 'DELETE'
    })
    fetchData() // ลบเสร็จโหลดข้อมูลใหม่
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>💰 แอพรายรับ-รายจ่ายของ Boss</h1>
      
      {/* ส่วนแสดงยอดเงิน (เหมือนเดิม) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center' }}>
        <div style={{ background: '#d1fae5', padding: '20px', borderRadius: '12px', width: '200px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#065f46' }}>รายรับรวม</h3>
          <h2 style={{ margin: 0, color: '#059669' }}>+{summary.totalIncome.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '12px', width: '200px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#991b1b' }}>รายจ่ายรวม</h3>
          <h2 style={{ margin: 0, color: '#dc2626' }}>-{summary.totalExpense.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#e0f2fe', padding: '20px', borderRadius: '12px', width: '200px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#075985' }}>คงเหลือสุทธิ</h3>
          <h2 style={{ margin: 0, color: summary.balance < 0 ? '#dc2626' : '#0284c7' }}>
            {summary.balance.toLocaleString()} บาท
          </h2>
        </div>
      </div>

      {/* --- ส่วนฟอร์มกรอกข้อมูล (เพิ่มใหม่) --- */}
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e5e7eb' }}>
        <h3>➕ เพิ่มรายการใหม่</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            name="title" 
            placeholder="ชื่อรายการ (เช่น ค่ากาแฟ)" 
            value={formData.title} 
            onChange={handleChange}
            required
            style={{ padding: '10px', flex: 2, borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <input 
            type="number" 
            name="amount" 
            placeholder="จำนวนเงิน" 
            value={formData.amount} 
            onChange={handleChange}
            required
            style={{ padding: '10px', flex: 1, borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="EXPENSE">รายจ่าย 💸</option>
            <option value="INCOME">รายรับ 💰</option>
          </select>
          <button type="submit" style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            บันทึก
          </button>
        </form>
      </div>

      {/* ส่วนรายการ (เพิ่มปุ่มลบ) */}
      <h3>📝 รายการบันทึก (ล่าสุด)</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {transactions.map((item) => (
          <li key={item.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '15px', 
            borderBottom: '1px solid #eee',
            background: item.type === 'INCOME' ? '#f0fdf4' : '#fff' 
          }}>
            <span>
              <strong>{item.title}</strong> 
              <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '10px' }}>
                ({new Date(item.date).toLocaleDateString('th-TH')})
              </span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ 
                fontWeight: 'bold', 
                color: item.type === 'INCOME' ? 'green' : 'red' 
              }}>
                {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString()}
              </span>
              <button 
                onClick={() => handleDelete(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
                title="ลบรายการ"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App