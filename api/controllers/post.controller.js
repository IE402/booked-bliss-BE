import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
    const query = req.query;
    try {
        const posts = await prisma.post.findMany({
            where: {
                city: query.city || undefined,
                type: query.type || undefined,
                property: query.property || undefined,
                bedroom: parseInt(query.bedroom) || undefined,
                price: {
                    gte: parseInt(query.minPrice) || 0,
                    lte: parseInt(query.maxprice) || 10000000,
                }
            }
        });
        
        // setTimeout(() => {
        //     res.status(200).json(posts);
        // }, 3000);
        res.status(200).json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to get posts" })
    }
}

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
                const payload = jwt.verify(token, process.env.JWT_SECRET_KEY || "hvupham",);

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
                if (req.method === 'DELETE' && isSaved) {
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


export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;

    try {
        const newPost = await prisma.post.create({
            data: {
                ...body.postData,
                userId: tokenUserId,
                // createdAt: new Date(Date.now() + 7 * 60 * 60 * 1000),
                postDetail: {
                    create: body.postDetail,
                }
            },
        });
        res.status(200).json(newPost);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to create post" });
    }
}

export const updatePost = async (req, res) => {
    try {

        res.status(200).json({ message })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to update post" })
    }
}

export const deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId

    try {
        const post = await prisma.post.findUnique({
            where: { id }
        });

        if (post.userId !== tokenUserId) {
            return res.status(400).json({ message: "Not Authorized!" });
        }

        await prisma.post.delete({
            where: { id },
        });

        res.status(200).json({ message: "Post deleted!" });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to delete posts" });
    }
}
