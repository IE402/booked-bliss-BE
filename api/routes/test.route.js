import express from "express";
import { shouldBeAdmin, shouldBeLoggedIn } from "../controllers/test.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router()

router.get("/should-be-logged-in", verifyToken, shouldBeLoggedIn);
router.get("/should-be-admin", shouldBeAdmin);

// router.get("/should-be-logged-in", (req, res) => {
//     console.log("router works!")
// });
// router.post("/should-be-admin", (req, res) => {
//     console.log("router works!")
// });

export default router;