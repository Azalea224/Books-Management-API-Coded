import { Router } from 'express';
import authorRoutes from './authorRoutes';
import categoryRoutes from './categoryRoutes';
import bookRoutes from './bookRoutes';

const router = Router();

router.use('/authors', authorRoutes);
router.use('/categories', categoryRoutes);
router.use('/books', bookRoutes);

export default router;

