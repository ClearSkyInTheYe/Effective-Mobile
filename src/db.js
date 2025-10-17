const { PrismaClient } = require('./generated/prisma/client');
const prisma = new PrismaClient();

function createUser({
  email,
  password,
  name,
  lastname,
  surname,
  birthDate,
}) {
  return prisma.user.create({
    data: {
      email,
      password,
      name,
      lastname,
      surname,
      birthDate,
    },
  });
}


const userFildes = { 
                    id: true, 
                    email: true,
                    name: true,
                    lastname: true,
                    surname: true,
                    birthDate: true,
                    role: true,
                    isActive: true
}


module.exports = { createUser, prisma, userFildes };