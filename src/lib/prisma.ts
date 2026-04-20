import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// 1. Pega a URL do Neon no seu .env
const connectionString = process.env.DATABASE_URL as string;

// 2. Cria um "Pool" de conexões (muito mais rápido e estável para bancos em nuvem)
const pool = new Pool({ connectionString });

// 3. Cria o adaptador do Postgres usando o Pool
const adapter = new PrismaPg(pool);

// 4. Entrega o adaptador pronto para o PrismaClient!
export const prisma = new PrismaClient({ adapter });