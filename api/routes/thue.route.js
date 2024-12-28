import express from "express";

import { addThue, getAllHopDong, getAllHopDongByUserId } from "../controllers/thue.controller.js";
const router = express.Router();

router.post("/", addThue);
router.get("/", getAllHopDong);
router.get("/:id", getAllHopDongByUserId);


export default router;
