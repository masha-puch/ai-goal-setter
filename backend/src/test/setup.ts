// Test setup for backend
import { PrismaClient } from '../../generated/prisma'

// Mock Prisma client for testing
jest.mock('../../generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    goal: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}))

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}
