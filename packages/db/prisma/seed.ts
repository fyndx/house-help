import { PrismaClient, ServiceCategory, UserRole } from "./generated/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
	// Create Services
	const services = await prisma.service.createMany({
		data: [
			{
				name: "Cleaning",
				slug: "cleaning",
				description: "Cleaning services",
				baseHourlyRate: new Decimal(100),
				category: ServiceCategory.CLEANING,
				isActive: true,
				minimumHours: 1,
			},
			{
				name: "Cooking",
				slug: "cooking",
				description: "Cooking services",
				baseHourlyRate: new Decimal(100),
				category: ServiceCategory.COOKING,
				isActive: true,
				minimumHours: 1,
			},
			{
				name: "Plumbing",
				slug: "plumbing",
				description: "Plumbing services",
				baseHourlyRate: new Decimal(100),
				category: ServiceCategory.PLUMBING,
				isActive: true,
				minimumHours: 1,
			},
			{
				name: "Electrical",
				slug: "electrical",
				description: "Electrical services",
				baseHourlyRate: new Decimal(100),
				category: ServiceCategory.ELECTRICAL,
				isActive: true,
				minimumHours: 1,
			},
		],
	});

	// Create Admin User
}
