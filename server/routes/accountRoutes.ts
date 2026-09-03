import express from 'express'
import { addAccount, disconnectAccounts, getAccounts } from '../controllers/accountController.js';
import { protect } from '../middlewares/authMiddleware.js';

const accountRouter=express.Router();

accountRouter.get('/',protect,getAccounts);
accountRouter.post('/',protect,addAccount);
accountRouter.delete('/:id',protect,disconnectAccounts)

export  default accountRouter