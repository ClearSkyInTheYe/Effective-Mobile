const  db = require('./db.js');
const middleware = require('./middleware.js');
const express = require('express');
const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken')
const env = require('dotenv').config().parsed;

const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ ok: true });
});

router.post('/api/register',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').isLength({ max: 100 }),
    body('lastname').isLength({ max: 100 }),
    body('surname').isLength({ max: 100 }),
    body('birthDate')
      .isISO8601({ strict: true })
      .withMessage('Birth date must be a valid ISO 8601 date (YYYY-MM-DD)')
      .toDate()
      .custom((value) => {
        const now = new Date();
        if (value > now) {
          throw new Error('Birth date cannot be in the future');
        }

        const age =
          now.getFullYear() -
          value.getFullYear() -
          (now < new Date(now.getFullYear(), value.getMonth(), value.getDate()) ? 1 : 0);

        if (age > 120) {
          throw new Error('Birth date seems unrealistic');
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {email, password, name, lastname, surname, birthDate} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.createUser({
            email,
            password: hashedPassword,
            name,
            lastname,
            surname,
            birthDate
        });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
  }
)


router.post('/api/login', async (req, res) => {
        const {email, password} = req.body

        try {
            const user = await db.prisma.user.findUnique({ where: {email} });
            if (!user) return res.status(400).json({message: 'Invalid email'});

            if (!user.isActive) return res.status(403).json({message: 'user blocked'});

            const ismatch = await bcrypt.compare(password, user.password)
            if (!ismatch) return res.status(400).json({message: 'Invalid password'});

            const token = jwt.sign({id: user.id, role: user.role}, env.SECRET_KEY, {expiresIn: '1h'});
            res.status(200).json({token, message: 'login succsess'});
        } catch (err) {
            res.status(500).json({ message: 'Error registering user', error: err.message });
        }
    }
)

router.get('/api/users', [middleware.authMiddleware, middleware.roleMiddleware('admin')], async (req, res) => {
    try {   
            const users =  await db.prisma.user.findMany({select: db.userFildes});
            res.status(200).json({ message: users });
        } catch (err) {
            res.status(500).json({ message: 'Error get users', error: err.message });
        }
    }
)

router.get('/api/users/:id', [middleware.authMiddleware, middleware.ensureUserOrAdmin], async (req, res) =>{
    try {
            const user = await db.prisma.user.findMany({select: db.userFildes, where: {id: Number(req.params.id)}});
            res.status(200).json({ message: user });
        } catch (err) {
            res.status(500).json({ message: 'Error get user', error: err.message });
        }
    }
)

router.post('/api/users/:id/block', [middleware.authMiddleware, middleware.ensureUserOrAdmin], async (req, res) =>{
    try {
            await db.prisma.user.update(
                {
                    where: {id: Number(req.params.id)},
                    data: { isActive: false }
                }
            );
            res.status(200).json({ message: 'user ' + String(req.params.id) + ' blocked' });
        } catch (err) {
            res.status(500).json({ message: 'Error block user', error: err.message });
        }
    }
)

module.exports = router;