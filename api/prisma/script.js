import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Cập nhật tất cả người dùng, thêm role mặc định là 'user'
  // const users = await prisma.user.updateMany({
  //   data: {
  //     role: 'user', // Hoặc 'admin', 'moderator' tùy theo yêu cầu
  //   },
  // });
  // console.log(users);
  // const users = await prisma.user.updateMany({
  //   data: {
  //     phone: '', // Hoặc 'admin', 'moderator' tùy theo yêu cầu
  //   },
  // });
  // console.log(users);

  // const users = await prisma.user.updateMany({
  //   data: {
  //     fullName: 'Phạm Hoài Vũ', // Hoặc 'admin', 'moderator' tùy theo yêu cầu
  //   },
  // });
  // console.log(users);

  const posts = await prisma.post.updateMany({
    data: {
      roomSpace: 5, // Hoặc 'admin', 'moderator' tùy theo yêu cầu
    },
  });
  console.log(posts);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
