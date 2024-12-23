import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      // orderBy: {
      //     createdAt: 'desc', // Sắp xếp theo thời gian tạo giảm dần
      // },
      select: {
        comment: true,
        star: true,
        post: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            username: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Failed to get reviews" });
  }
};

export const CountPostsByCity = async (req, res) => {
  try {
    // Lấy danh sách tỉnh/thành phố và số bài viết
    const cities = await prisma.post.groupBy({
      by: ["city"], // nhóm theo trường 'city'
      _count: {
        // đếm số lượng bài viết
        id: true, // đếm theo trường 'id'
      },
    });

    // Trả về danh sách tỉnh/thành phố và số bài viết
    const result = cities.map((city) => ({
      city: city.city,
      postCount: city._count.id, // số bài viết theo thành phố
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error counting posts by city:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const savePost = async (req, res) => {
  const userId = req.body.userId;
  const postId = req.body.postId;

  try {
    // Kiểm tra xem user này đã lưu bài viết có id này chưa
    const existingSavedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    if (existingSavedPost) {
      return res
        .status(400)
        .json({ message: "You have already saved this post." });
    }

    // Nếu chưa lưu, tạo mới một SavedPost
    const savedPost = await prisma.savedPost.create({
      data: {
        userId: userId,
        postId: postId,
      },
    });

    return res
      .status(201)
      .json({ message: "Post saved successfully.", savedPost });
  } catch (error) {
    console.error("Error saving post:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllSavedPostsByUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Tìm tất cả các SavedPost của người dùng này
    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId: userId,
      },
      include: {
        post: true, // Bao gồm thông tin về bài đăng liên quan (Post)
      },
    });

    // Kiểm tra nếu không tìm thấy bất kỳ bài đăng đã lưu nào
    if (savedPosts.length === 0) {
      return res
        .status(404)
        .json({ message: "No saved posts found for this user." });
    }
    // Trả về danh sách bài viết đã lưu
    const savedPostResponse = savedPosts.map((savedPost) => savedPost.post);

    return res.status(200).json(savedPostResponse);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllReviewByPost = async (req, res) => {
  const postId = req.params.id;

  try {
    // Tìm tất cả các đánh giá của bài viết
    const reviews = await prisma.review.findMany({
      where: {
        postId: postId, // Lọc theo ID bài viết
      },
      // orderBy: {
      //   id: "desc", // Sắp xếp theo thời gian tạo giảm dần
      // },
      select: {
        // Dùng `select` để lấy các trường thông thường
        id: true, // Lấy ID đánh giá
        comment: true, // Lấy bình luận
        star: true, // Lấy số sao đánh giá
        //   createdAt: true, // Thời gian tạo
        user: {
          // Lấy thông tin người dùng
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this post" });
    }

    // Trả về danh sách đánh giá của bài viết
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Failed to get reviews" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    // Tìm bài viết
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let isSaved = false;
    const token = req.cookies?.token;

    // Xác thực token nếu tồn tại
    if (token) {
      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET_KEY || "hvupham"
        );

        // Kiểm tra xem bài viết có được lưu chưa
        const saved = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              postId: id,
              userId: payload.id,
            },
          },
        });
        isSaved = saved ? true : false;

        // Nếu muốn xóa bài viết khỏi danh sách đã lưu
        if (req.method === "DELETE" && isSaved) {
          // Xóa bài viết khỏi danh sách đã lưu của người dùng
          await prisma.savedPost.delete({
            where: {
              userId_postId: {
                userId: payload.id,
                postId: id,
              },
            },
          });
          return res.status(200).json({ message: "Post unsaved successfully" });
        }
      } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Gửi phản hồi về bài viết và trạng thái lưu bài
    res.status(200).json({ ...post, isSaved });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addReview = async (req, res) => {
  const body = req.body;
  console.log("----------------", body);
  const tokenUserId = req.body.userId;
  const postId = req.body.postId;

  try {
    const newReview = await prisma.review.create({
      data: {
        ...body.review,
        // userId: tokenUserId,
        // createdAt: new Date(Date.now() + 7 * 60 * 60 * 1000),
        post: {
          connect: { id: postId },
        },
        user: {
          connect: { id: tokenUserId },
        },
      },
    });

    res.status(200).json(newReview);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post", tokenUserId });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json({ message });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(400).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete posts" });
  }
};
