import express from "express";
import { addAddress, deleteAddresses, getAddresses, updateAddresses } from "../controllers/addressController.js";
import auth from "../middleware/auth.js";

const addressRouter = express.Router();

addressRouter.get('/',auth,getAddresses);
addressRouter.post('/',auth,addAddress);
addressRouter.put('/:id',auth,updateAddresses);
addressRouter.delete('/:id',auth,deleteAddresses);

export default addressRouter;