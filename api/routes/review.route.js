import express from "express";
import {
  getPosts,
  getPost,
  addPost,
  updatePost,
  deletePost,
  savePost,
  getAllSavedPostsByUser,
  getAllPostsByUser,
  CountPostsByCity,
} from "../controllers/post.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  addReview,
  getAllReviewByPost,
  getAllReviews,
} from "../controllers/review.controller.js";
const router = express.Router();

router.get("/", getAllReviews);
router.get("/:id", getPost);
router.get("/city/count", CountPostsByCity);
router.post("/", addReview);
router.get("/getByPost/:id", getAllReviewByPost);
router.post("/savePost", savePost);
router.get("/savePost/:id", getAllSavedPostsByUser);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

router.get("/homePosts", getPosts);

export default router;
