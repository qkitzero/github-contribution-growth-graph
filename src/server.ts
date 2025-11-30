import express from 'express';
import { ErrorMiddleware } from './interface/middleware/error';
import graphRoutes from './routes/graphRoutes';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use('/graphs', graphRoutes);

app.use(ErrorMiddleware.handle);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
