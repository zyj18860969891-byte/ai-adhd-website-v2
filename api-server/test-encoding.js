import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 测试编码问题的端点
app.post('/api/test-encoding', (req, res) => {
  console.log('收到请求体:', JSON.stringify(req.body, null, 2));
  console.log('任务描述:', req.body.data?.task);
  console.log('任务描述长度:', req.body.data?.task?.length);
  console.log('任务描述Buffer:', Buffer.from(req.body.data?.task || '', 'utf8'));
  
  res.json({
    original: req.body.data?.task,
    length: req.body.data?.task?.length,
    buffer: Buffer.from(req.body.data?.task || '', 'utf8').toString('hex'),
    success: true
  });
});

app.listen(3001, () => {
  console.log('测试服务器运行在端口 3001');
});