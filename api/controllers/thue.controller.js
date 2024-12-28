import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
export const addThue = async (req, res) => {
  const postId = req.body.postId;
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId in request body" });
  }
  console.log(userId, postId);

  try {
    // Tìm bài viết
    const currentPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true } },
      },
    });

    if (!currentPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const ownerId = currentPost.user?.id;
    if (!ownerId) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Tạo hợp đồng thuê
    await prisma.hopDong.create({
      data: {
        userIDs: Array.from(new Set([ownerId, userId])), // Đảm bảo không trùng lặp
        postId: postId,
      },
    });

    res.status(200).json({ message: "Thuê thành công" });
  } catch (err) {
    console.error("Error adding thuê:", err);
    res.status(500).json({ message: "Có lỗi xảy ra", error: err.message });
  }
};

export const getAllHopDong = async (req, res) => {
  try {
    const reviews = await prisma.hopDong.findMany({
      include: {
        // user: { select: { id: true, name: true } },
        post: { select: { id: true, title: true, address: true, price: true } },

        
      },
    });

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Failed to get reviews" });
  }
};

export const getAllHopDongByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    // Lấy tất cả hợp đồng mà userIDs chứa userId
    const hopdongs = await prisma.hopDong.findMany({
      where: {
        userIDs: {
          has: userId, // userId nằm trong mảng userIDs
        },
      },
    });

    // Lọc lại hợp đồng: chỉ giữ hợp đồng có userId là phần tử đầu tiên
    const filteredHopDongs = hopdongs.filter(
      (hopDong) => hopDong.userIDs[0] === userId
    );

    res.status(200).json(filteredHopDongs);
  } catch (err) {
    console.error("Error fetching hopDongs:", err);
    res
      .status(500)
      .json({ message: "Failed to get hopDongs", error: err.message });
  }
};
